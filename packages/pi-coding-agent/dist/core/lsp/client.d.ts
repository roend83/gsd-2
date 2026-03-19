import type { LspClient, ServerConfig } from "./types.js";
/**
 * Configure the idle timeout for LSP clients.
 */
export declare function setIdleTimeout(ms: number | null | undefined): void;
/** Timeout for warmup initialize requests (5 seconds) */
export declare const WARMUP_TIMEOUT_MS = 5000;
/**
 * Get or create an LSP client for the given server configuration and working directory.
 */
export declare function getOrCreateClient(config: ServerConfig, cwd: string, initTimeoutMs?: number): Promise<LspClient>;
/**
 * Ensure a file is opened in the LSP client.
 */
export declare function ensureFileOpen(client: LspClient, filePath: string, signal?: AbortSignal): Promise<void>;
/**
 * Sync in-memory content to the LSP client without reading from disk.
 */
export declare function syncContent(client: LspClient, filePath: string, content: string, signal?: AbortSignal): Promise<void>;
/**
 * Notify LSP that a file was saved.
 */
export declare function notifySaved(client: LspClient, filePath: string, signal?: AbortSignal): Promise<void>;
/**
 * Refresh a file in the LSP client.
 */
export declare function refreshFile(client: LspClient, filePath: string, signal?: AbortSignal): Promise<void>;
/**
 * Notify all LSP clients that have the file open that it changed on disk.
 * Synchronous entry point — async refresh runs in background.
 * Swallows errors so editing never fails because of LSP.
 */
export declare function notifyFileChanged(filePath: string): void;
/**
 * Shutdown a specific client by key.
 */
export declare function shutdownClient(key: string): void;
export declare function sendRequest(client: LspClient, method: string, params: unknown, signal?: AbortSignal, timeoutMs?: number): Promise<unknown>;
export declare function sendNotification(client: LspClient, method: string, params: unknown): Promise<void>;
/**
 * Shutdown all LSP clients.
 */
export declare function shutdownAll(): void;
/** Status of an LSP server */
export interface LspServerStatus {
    name: string;
    status: "connecting" | "ready" | "error";
    fileTypes: string[];
    error?: string;
}
export declare function getActiveClients(): LspServerStatus[];
//# sourceMappingURL=client.d.ts.map