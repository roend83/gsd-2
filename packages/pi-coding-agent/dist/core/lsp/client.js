import { spawn } from "node:child_process";
import * as fsPromises from "node:fs/promises";
import { killProcessTree } from "../../utils/shell.js";
import { ToolAbortError, isEnoent, throwIfAborted, untilAborted } from "./helpers.js";
import { applyWorkspaceEdit } from "./edits.js";
import { getLspmuxCommand, isLspmuxSupported } from "./lspmux.js";
import { detectLanguageId, fileToUri } from "./utils.js";
// =============================================================================
// Client State
// =============================================================================
const clients = new Map();
const clientLocks = new Map();
const fileOperationLocks = new Map();
// Idle timeout configuration (disabled by default)
let idleTimeoutMs = null;
let idleCheckInterval = null;
const IDLE_CHECK_INTERVAL_MS = 60 * 1000;
/**
 * Configure the idle timeout for LSP clients.
 */
export function setIdleTimeout(ms) {
    idleTimeoutMs = ms ?? null;
    if (idleTimeoutMs && idleTimeoutMs > 0) {
        startIdleChecker();
    }
    else {
        stopIdleChecker();
    }
}
function startIdleChecker() {
    if (idleCheckInterval)
        return;
    idleCheckInterval = setInterval(() => {
        if (!idleTimeoutMs)
            return;
        const now = Date.now();
        for (const [key, client] of Array.from(clients.entries())) {
            if (now - client.lastActivity > idleTimeoutMs) {
                shutdownClient(key);
            }
        }
    }, IDLE_CHECK_INTERVAL_MS);
}
function stopIdleChecker() {
    if (idleCheckInterval) {
        clearInterval(idleCheckInterval);
        idleCheckInterval = null;
    }
}
// =============================================================================
// Client Capabilities
// =============================================================================
const CLIENT_CAPABILITIES = {
    textDocument: {
        synchronization: {
            didSave: true,
            dynamicRegistration: false,
            willSave: false,
            willSaveWaitUntil: false,
        },
        hover: {
            contentFormat: ["markdown", "plaintext"],
            dynamicRegistration: false,
        },
        definition: {
            dynamicRegistration: false,
            linkSupport: true,
        },
        typeDefinition: {
            dynamicRegistration: false,
            linkSupport: true,
        },
        implementation: {
            dynamicRegistration: false,
            linkSupport: true,
        },
        references: {
            dynamicRegistration: false,
        },
        documentSymbol: {
            dynamicRegistration: false,
            hierarchicalDocumentSymbolSupport: true,
            symbolKind: {
                valueSet: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
            },
        },
        rename: {
            dynamicRegistration: false,
            prepareSupport: true,
        },
        codeAction: {
            dynamicRegistration: false,
            codeActionLiteralSupport: {
                codeActionKind: {
                    valueSet: [
                        "quickfix",
                        "refactor",
                        "refactor.extract",
                        "refactor.inline",
                        "refactor.rewrite",
                        "source",
                        "source.organizeImports",
                        "source.fixAll",
                    ],
                },
            },
            resolveSupport: {
                properties: ["edit"],
            },
        },
        callHierarchy: {
            dynamicRegistration: false,
        },
        signatureHelp: {
            dynamicRegistration: false,
            signatureInformation: {
                documentationFormat: ["markdown", "plaintext"],
                parameterInformation: {
                    labelOffsetSupport: true,
                },
            },
        },
        formatting: {
            dynamicRegistration: false,
        },
        rangeFormatting: {
            dynamicRegistration: false,
        },
        publishDiagnostics: {
            relatedInformation: true,
            versionSupport: false,
            tagSupport: { valueSet: [1, 2] },
            codeDescriptionSupport: true,
            dataSupport: true,
        },
    },
    workspace: {
        applyEdit: true,
        workspaceEdit: {
            documentChanges: true,
            resourceOperations: ["create", "rename", "delete"],
            failureHandling: "textOnlyTransactional",
        },
        configuration: true,
        symbol: {
            dynamicRegistration: false,
            symbolKind: {
                valueSet: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
            },
        },
    },
    experimental: {
        snippetTextEdit: true,
    },
};
// =============================================================================
// LSP Message Protocol
// =============================================================================
function parseMessage(buffer) {
    const headerEndIndex = findHeaderEnd(buffer);
    if (headerEndIndex === -1)
        return null;
    const headerText = new TextDecoder().decode(buffer.slice(0, headerEndIndex));
    const contentLengthMatch = headerText.match(/Content-Length: (\d+)/i);
    if (!contentLengthMatch)
        return null;
    const contentLength = Number.parseInt(contentLengthMatch[1], 10);
    const messageStart = headerEndIndex + 4; // Skip \r\n\r\n
    const messageEnd = messageStart + contentLength;
    if (buffer.length < messageEnd)
        return null;
    const messageBytes = buffer.subarray(messageStart, messageEnd);
    const messageText = new TextDecoder().decode(messageBytes);
    const remaining = Buffer.from(buffer.subarray(messageEnd));
    let message;
    try {
        message = JSON.parse(messageText);
    }
    catch (err) {
        // Malformed JSON from LSP server — log and skip this message
        if (process.env.DEBUG) {
            const preview = messageText.length > 200 ? messageText.slice(0, 200) + "..." : messageText;
            console.error(`[lsp] Dropped malformed JSON message: ${err instanceof Error ? err.message : err} — ${preview}`);
        }
        return { message: null, remaining };
    }
    return { message, remaining };
}
function findHeaderEnd(buffer) {
    for (let i = 0; i < buffer.length - 3; i++) {
        if (buffer[i] === 13 && buffer[i + 1] === 10 && buffer[i + 2] === 13 && buffer[i + 3] === 10) {
            return i;
        }
    }
    return -1;
}
async function writeMessage(stdin, message) {
    if (!stdin) {
        throw new Error("LSP process stdin is not available");
    }
    const content = JSON.stringify(message);
    const header = `Content-Length: ${Buffer.byteLength(content, "utf-8")}\r\n\r\n`;
    return new Promise((resolve, reject) => {
        stdin.write(header + content, (err) => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
// =============================================================================
// Message Reader
// =============================================================================
async function startMessageReader(client) {
    if (client.isReading)
        return;
    client.isReading = true;
    const stdout = client.proc.stdout;
    if (!stdout) {
        client.isReading = false;
        return;
    }
    return new Promise((resolve) => {
        stdout.on("data", async (chunk) => {
            const currentBuffer = Buffer.concat([client.messageBuffer, chunk]);
            client.messageBuffer = currentBuffer;
            let workingBuffer = currentBuffer;
            let parsed = parseMessage(workingBuffer);
            while (parsed) {
                const { message, remaining } = parsed;
                workingBuffer = remaining;
                if (!message) {
                    parsed = parseMessage(workingBuffer);
                    continue;
                }
                if ("id" in message && message.id !== undefined) {
                    const pending = client.pendingRequests.get(message.id);
                    if (pending) {
                        client.pendingRequests.delete(message.id);
                        if ("error" in message && message.error) {
                            pending.reject(new Error(`LSP error: ${message.error.message}`));
                        }
                        else {
                            pending.resolve(message.result);
                        }
                    }
                    else if ("method" in message) {
                        await handleServerRequest(client, message);
                    }
                }
                else if ("method" in message) {
                    if (message.method === "textDocument/publishDiagnostics" && message.params) {
                        const params = message.params;
                        client.diagnostics.set(params.uri, params.diagnostics);
                        client.diagnosticsVersion += 1;
                    }
                }
                parsed = parseMessage(workingBuffer);
            }
            client.messageBuffer = workingBuffer;
        });
        stdout.on("end", () => {
            client.isReading = false;
            resolve();
        });
        stdout.on("error", () => {
            client.isReading = false;
            resolve();
        });
    });
}
// =============================================================================
// Server Request Handlers
// =============================================================================
async function handleConfigurationRequest(client, message) {
    if (typeof message.id !== "number")
        return;
    const params = message.params;
    const items = params?.items ?? [];
    const result = items.map(item => {
        const section = item.section ?? "";
        return client.config.settings?.[section] ?? {};
    });
    await sendResponse(client, message.id, result, "workspace/configuration");
}
async function handleApplyEditRequest(client, message) {
    if (typeof message.id !== "number")
        return;
    const params = message.params;
    if (!params?.edit) {
        await sendResponse(client, message.id, { applied: false, failureReason: "No edit provided" }, "workspace/applyEdit");
        return;
    }
    try {
        await applyWorkspaceEdit(params.edit, client.cwd);
        await sendResponse(client, message.id, { applied: true }, "workspace/applyEdit");
    }
    catch (err) {
        await sendResponse(client, message.id, { applied: false, failureReason: String(err) }, "workspace/applyEdit");
    }
}
async function handleServerRequest(client, message) {
    if (message.method === "workspace/configuration") {
        await handleConfigurationRequest(client, message);
        return;
    }
    if (message.method === "workspace/applyEdit") {
        await handleApplyEditRequest(client, message);
        return;
    }
    if (typeof message.id !== "number")
        return;
    await sendResponse(client, message.id, null, message.method, {
        code: -32601,
        message: `Method not found: ${message.method}`,
    });
}
async function sendResponse(client, id, result, _method, error) {
    const response = {
        jsonrpc: "2.0",
        id,
        ...(error ? { error } : { result }),
    };
    try {
        await writeMessage(client.proc.stdin, response);
    }
    catch {
        // Failed to respond to server request
    }
}
// =============================================================================
// Stderr Buffer
// =============================================================================
async function startStderrReader(client) {
    const stderr = client.proc.stderr;
    if (!stderr)
        return;
    return new Promise((resolve) => {
        stderr.on("data", (chunk) => {
            const text = chunk.toString("utf-8");
            client.stderrBuffer += text;
            if (client.stderrBuffer.length > 4096) {
                client.stderrBuffer = client.stderrBuffer.slice(-4096);
            }
        });
        stderr.on("end", () => {
            resolve();
        });
        stderr.on("error", () => {
            resolve();
        });
    });
}
// =============================================================================
// Client Management
// =============================================================================
/** Timeout for warmup initialize requests (5 seconds) */
export const WARMUP_TIMEOUT_MS = 5000;
/**
 * Get or create an LSP client for the given server configuration and working directory.
 */
export async function getOrCreateClient(config, cwd, initTimeoutMs) {
    const maxRetries = 2;
    let lastErr;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await getOrCreateClientOnce(config, cwd, initTimeoutMs);
        }
        catch (err) {
            lastErr = err;
            if (attempt < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }
    throw lastErr;
}
async function getOrCreateClientOnce(config, cwd, initTimeoutMs) {
    const key = `${config.command}:${cwd}`;
    const existingClient = clients.get(key);
    if (existingClient) {
        existingClient.lastActivity = Date.now();
        return existingClient;
    }
    const existingLock = clientLocks.get(key);
    if (existingLock) {
        return existingLock;
    }
    const clientPromise = (async () => {
        const baseCommand = config.resolvedCommand ?? config.command;
        const baseArgs = config.args ?? [];
        // Wrap with lspmux if available and supported
        const { command, args, env } = isLspmuxSupported(baseCommand)
            ? await getLspmuxCommand(baseCommand, baseArgs)
            : { command: baseCommand, args: baseArgs };
        const proc = spawn(command, args, {
            cwd,
            stdio: ["pipe", "pipe", "pipe"],
            env: env ? { ...process.env, ...env } : undefined,
            // On Windows, executables like npx/tsc are .cmd scripts that need
            // shell resolution. Without this, spawn fails with ENOENT (#1222).
            shell: process.platform === "win32",
        });
        // Handle spawn failure (e.g., ENOENT when the command doesn't exist).
        // Without this, the error bubbles up and can crash auto-mode (#901).
        proc.on("error", (err) => {
            if (err.code === "ENOENT") {
                proc.emit("exit", 1);
            }
        });
        const exitedPromise = new Promise((resolve) => {
            proc.on("exit", (code) => resolve(code ?? 1));
        });
        const client = {
            name: key,
            cwd,
            proc: {
                stdin: proc.stdin,
                stdout: proc.stdout,
                stderr: proc.stderr,
                pid: proc.pid ?? 0,
                exitCode: null,
                exited: exitedPromise,
                kill: (signal) => proc.kill(signal),
            },
            config,
            requestId: 0,
            diagnostics: new Map(),
            diagnosticsVersion: 0,
            openFiles: new Map(),
            pendingRequests: new Map(),
            messageBuffer: Buffer.alloc(0),
            isReading: false,
            lastActivity: Date.now(),
            stderrBuffer: "",
        };
        clients.set(key, client);
        // Register crash recovery
        exitedPromise.then((code) => {
            client.proc.exitCode = code;
            clients.delete(key);
            clientLocks.delete(key);
            if (client.pendingRequests.size > 0) {
                const stderr = client.stderrBuffer.trim();
                const err = new Error(stderr ? `LSP server exited (code ${code}): ${stderr}` : `LSP server exited unexpectedly (code ${code})`);
                for (const pending of client.pendingRequests.values()) {
                    pending.reject(err);
                }
                client.pendingRequests.clear();
            }
        });
        // Start background readers
        startMessageReader(client);
        startStderrReader(client);
        try {
            const initResult = (await sendRequest(client, "initialize", {
                processId: process.pid,
                rootUri: fileToUri(cwd),
                rootPath: cwd,
                capabilities: CLIENT_CAPABILITIES,
                initializationOptions: config.initOptions ?? {},
                workspaceFolders: [{ uri: fileToUri(cwd), name: cwd.split("/").pop() ?? "workspace" }],
            }, undefined, // signal
            initTimeoutMs));
            if (!initResult) {
                throw new Error("Failed to initialize LSP: no response");
            }
            client.serverCapabilities = initResult.capabilities;
            await sendNotification(client, "initialized", {});
            return client;
        }
        catch (err) {
            clients.delete(key);
            clientLocks.delete(key);
            try {
                killProcessTree(proc.pid ?? 0);
            }
            catch {
                proc.kill();
            }
            throw err;
        }
        finally {
            clientLocks.delete(key);
        }
    })();
    clientLocks.set(key, clientPromise);
    return clientPromise;
}
/**
 * Ensure a file is opened in the LSP client.
 */
export async function ensureFileOpen(client, filePath, signal) {
    throwIfAborted(signal);
    const uri = fileToUri(filePath);
    const lockKey = `${client.name}:${uri}`;
    if (client.openFiles.has(uri)) {
        return;
    }
    const existingLock = fileOperationLocks.get(lockKey);
    if (existingLock) {
        await untilAborted(signal, () => existingLock);
        return;
    }
    const openPromise = (async () => {
        throwIfAborted(signal);
        if (client.openFiles.has(uri)) {
            return;
        }
        let content;
        try {
            content = await fsPromises.readFile(filePath, "utf-8");
            throwIfAborted(signal);
        }
        catch (err) {
            if (isEnoent(err))
                return;
            throw err;
        }
        const languageId = detectLanguageId(filePath);
        throwIfAborted(signal);
        await sendNotification(client, "textDocument/didOpen", {
            textDocument: {
                uri,
                languageId,
                version: 1,
                text: content,
            },
        });
        client.openFiles.set(uri, { version: 1, languageId });
        client.lastActivity = Date.now();
    })();
    fileOperationLocks.set(lockKey, openPromise);
    try {
        await openPromise;
    }
    finally {
        fileOperationLocks.delete(lockKey);
    }
}
/**
 * Sync in-memory content to the LSP client without reading from disk.
 */
export async function syncContent(client, filePath, content, signal) {
    const uri = fileToUri(filePath);
    const lockKey = `${client.name}:${uri}`;
    throwIfAborted(signal);
    const existingLock = fileOperationLocks.get(lockKey);
    if (existingLock) {
        await untilAborted(signal, () => existingLock);
    }
    const syncPromise = (async () => {
        client.diagnostics.delete(uri);
        const info = client.openFiles.get(uri);
        if (!info) {
            const languageId = detectLanguageId(filePath);
            throwIfAborted(signal);
            await sendNotification(client, "textDocument/didOpen", {
                textDocument: {
                    uri,
                    languageId,
                    version: 1,
                    text: content,
                },
            });
            client.openFiles.set(uri, { version: 1, languageId });
            client.lastActivity = Date.now();
            return;
        }
        const version = ++info.version;
        throwIfAborted(signal);
        await sendNotification(client, "textDocument/didChange", {
            textDocument: { uri, version },
            contentChanges: [{ text: content }],
        });
        client.lastActivity = Date.now();
    })();
    fileOperationLocks.set(lockKey, syncPromise);
    try {
        await syncPromise;
    }
    finally {
        fileOperationLocks.delete(lockKey);
    }
}
/**
 * Notify LSP that a file was saved.
 */
export async function notifySaved(client, filePath, signal) {
    const uri = fileToUri(filePath);
    const info = client.openFiles.get(uri);
    if (!info)
        return;
    throwIfAborted(signal);
    await sendNotification(client, "textDocument/didSave", {
        textDocument: { uri },
    });
    client.lastActivity = Date.now();
}
/**
 * Refresh a file in the LSP client.
 */
export async function refreshFile(client, filePath, signal) {
    throwIfAborted(signal);
    const uri = fileToUri(filePath);
    const lockKey = `${client.name}:${uri}`;
    const existingLock = fileOperationLocks.get(lockKey);
    if (existingLock) {
        await untilAborted(signal, () => existingLock);
    }
    const refreshPromise = (async () => {
        throwIfAborted(signal);
        const info = client.openFiles.get(uri);
        if (!info) {
            await ensureFileOpen(client, filePath, signal);
            return;
        }
        let content;
        try {
            content = await fsPromises.readFile(filePath, "utf-8");
            throwIfAborted(signal);
        }
        catch (err) {
            if (isEnoent(err))
                return;
            throw err;
        }
        const version = ++info.version;
        throwIfAborted(signal);
        await sendNotification(client, "textDocument/didChange", {
            textDocument: { uri, version },
            contentChanges: [{ text: content }],
        });
        throwIfAborted(signal);
        await sendNotification(client, "textDocument/didSave", {
            textDocument: { uri },
            text: content,
        });
        client.lastActivity = Date.now();
    })();
    fileOperationLocks.set(lockKey, refreshPromise);
    try {
        await refreshPromise;
    }
    finally {
        fileOperationLocks.delete(lockKey);
    }
}
/**
 * Notify all LSP clients that have the file open that it changed on disk.
 * Synchronous entry point — async refresh runs in background.
 * Swallows errors so editing never fails because of LSP.
 */
export function notifyFileChanged(filePath) {
    const uri = fileToUri(filePath);
    for (const client of clients.values()) {
        if (client.openFiles.has(uri)) {
            refreshFile(client, filePath).catch(() => { });
        }
    }
}
/**
 * Shutdown a specific client by key.
 */
export function shutdownClient(key) {
    const client = clients.get(key);
    if (!client)
        return;
    for (const pending of Array.from(client.pendingRequests.values())) {
        pending.reject(new Error("LSP client shutdown"));
    }
    client.pendingRequests.clear();
    sendRequest(client, "shutdown", null).catch(() => { });
    try {
        killProcessTree(client.proc.pid);
    }
    catch {
        client.proc.kill();
    }
    clients.delete(key);
}
// =============================================================================
// LSP Protocol Methods
// =============================================================================
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
export async function sendRequest(client, method, params, signal, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
    const id = ++client.requestId;
    if (signal?.aborted) {
        const reason = signal.reason instanceof Error ? signal.reason : new ToolAbortError();
        return Promise.reject(reason);
    }
    const request = {
        jsonrpc: "2.0",
        id,
        method,
        params,
    };
    client.lastActivity = Date.now();
    const { promise, resolve, reject } = Promise.withResolvers();
    let timeout;
    const cleanup = () => {
        if (signal) {
            signal.removeEventListener("abort", abortHandler);
        }
    };
    const abortHandler = () => {
        if (client.pendingRequests.has(id)) {
            client.pendingRequests.delete(id);
        }
        void sendNotification(client, "$/cancelRequest", { id }).catch(() => { });
        if (timeout)
            clearTimeout(timeout);
        cleanup();
        const reason = signal?.reason instanceof Error ? signal.reason : new ToolAbortError();
        reject(reason);
    };
    timeout = setTimeout(() => {
        if (client.pendingRequests.has(id)) {
            client.pendingRequests.delete(id);
            const err = new Error(`LSP request ${method} timed out after ${timeoutMs}ms`);
            cleanup();
            reject(err);
        }
    }, timeoutMs);
    if (signal) {
        signal.addEventListener("abort", abortHandler, { once: true });
        if (signal.aborted) {
            abortHandler();
            return promise;
        }
    }
    client.pendingRequests.set(id, {
        resolve: (result) => {
            if (timeout)
                clearTimeout(timeout);
            cleanup();
            resolve(result);
        },
        reject: (err) => {
            if (timeout)
                clearTimeout(timeout);
            cleanup();
            reject(err);
        },
        method,
    });
    writeMessage(client.proc.stdin, request).catch((err) => {
        if (timeout)
            clearTimeout(timeout);
        client.pendingRequests.delete(id);
        cleanup();
        reject(err);
    });
    return promise;
}
export async function sendNotification(client, method, params) {
    const notification = {
        jsonrpc: "2.0",
        method,
        params,
    };
    client.lastActivity = Date.now();
    try {
        await writeMessage(client.proc.stdin, notification);
    }
    catch (err) {
        // EPIPE means the LSP process died (e.g. after lsp.reload killed it).
        // Swallow so callers don't crash — the next getOrCreateClient call
        // will spawn a fresh server (#815).
        if (err instanceof Error && 'code' in err && err.code === 'EPIPE') {
            return;
        }
        throw err;
    }
}
/**
 * Shutdown all LSP clients.
 */
export function shutdownAll() {
    const clientsToShutdown = Array.from(clients.values());
    clients.clear();
    const err = new Error("LSP client shutdown");
    for (const client of clientsToShutdown) {
        const reqs = Array.from(client.pendingRequests.values());
        client.pendingRequests.clear();
        for (const pending of reqs) {
            pending.reject(err);
        }
        void (async () => {
            const timeout = new Promise(resolve => setTimeout(resolve, 5_000));
            const result = sendRequest(client, "shutdown", null).catch(() => { });
            await Promise.race([result, timeout]);
            try {
                killProcessTree(client.proc.pid);
            }
            catch {
                client.proc.kill();
            }
        })().catch(() => { });
    }
}
export function getActiveClients() {
    return Array.from(clients.values()).map(client => ({
        name: client.config.command,
        status: "ready",
        fileTypes: client.config.fileTypes,
    }));
}
// =============================================================================
// Process Cleanup
// =============================================================================
if (typeof process !== "undefined") {
    process.on("beforeExit", shutdownAll);
    process.on("SIGINT", () => {
        shutdownAll();
        process.exit(0);
    });
    process.on("SIGTERM", () => {
        shutdownAll();
        process.exit(0);
    });
}
//# sourceMappingURL=client.js.map