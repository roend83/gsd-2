import { execSync, spawn } from "node:child_process";
import * as fsPromises from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { LSP_LIVENESS_TIMEOUT_MS, LSP_STATE_CACHE_TTL_MS } from "../constants.js";
// =============================================================================
// Constants
// =============================================================================
const DEFAULT_SUPPORTED_SERVERS = new Set([
    "rust-analyzer",
]);
// =============================================================================
// Helpers
// =============================================================================
function which(command) {
    try {
        // On Windows, prefer `where.exe` over `which` — MSYS/Git Bash's `which`
        // returns POSIX paths (/c/Users/...) that Node's spawn() can't execute (#1121).
        const isWindows = process.platform === "win32";
        const cmd = isWindows ? "where.exe" : "which";
        const result = isWindows
            ? execSync(`${cmd} ${command}`, { encoding: "utf-8" })
            : execSync(`which ${command}`, { encoding: "utf-8" });
        // `where.exe` may return multiple lines — take the first
        const resolved = result.trim().split(/\r?\n/)[0]?.trim();
        return resolved || null;
    }
    catch {
        return null;
    }
}
// =============================================================================
// Config Path
// =============================================================================
function getConfigPath() {
    const home = os.homedir();
    switch (os.platform()) {
        case "win32":
            return path.join(process.env.APPDATA ?? path.join(home, "AppData", "Roaming"), "lspmux", "config.toml");
        case "darwin":
            return path.join(home, "Library", "Application Support", "lspmux", "config.toml");
        default:
            return path.join(process.env.XDG_CONFIG_HOME ?? path.join(home, ".config"), "lspmux", "config.toml");
    }
}
// =============================================================================
// State Management
// =============================================================================
let cachedState = null;
let cacheTimestamp = 0;
async function parseConfig() {
    try {
        const configPath = getConfigPath();
        // lspmux config uses TOML, but since we're stripping TOML support,
        // attempt a simple key=value parse for the config file.
        // If the config file exists but can't be parsed, return null.
        try {
            await fsPromises.access(configPath);
        }
        catch {
            return null;
        }
        // Config exists but we can't parse TOML without a dependency.
        // Return an empty config object to indicate the file exists.
        return {};
    }
    catch {
        return null;
    }
}
async function checkServerRunning(binaryPath) {
    try {
        const proc = spawn(binaryPath, ["status"], {
            stdio: ["ignore", "pipe", "pipe"],
        });
        const exited = await Promise.race([
            new Promise((resolve) => {
                proc.on("exit", (code) => resolve(code ?? 1));
            }),
            new Promise(resolve => setTimeout(() => resolve(null), LSP_LIVENESS_TIMEOUT_MS)),
        ]);
        if (exited === null) {
            proc.kill();
            return false;
        }
        return exited === 0;
    }
    catch {
        return false;
    }
}
export async function detectLspmux() {
    const now = Date.now();
    if (cachedState && now - cacheTimestamp < LSP_STATE_CACHE_TTL_MS) {
        return cachedState;
    }
    if (process.env.PI_DISABLE_LSPMUX === "1" || process.env.GSD_DISABLE_LSPMUX === "1") {
        cachedState = { available: false, running: false, binaryPath: null, config: null };
        cacheTimestamp = now;
        return cachedState;
    }
    const binaryPath = which("lspmux");
    if (!binaryPath) {
        cachedState = { available: false, running: false, binaryPath: null, config: null };
        cacheTimestamp = now;
        return cachedState;
    }
    const [config, running] = await Promise.all([parseConfig(), checkServerRunning(binaryPath)]);
    cachedState = { available: true, running, binaryPath, config };
    cacheTimestamp = now;
    return cachedState;
}
// =============================================================================
// Command Wrapping
// =============================================================================
export function isLspmuxSupported(command) {
    const baseName = command.split("/").pop() ?? command;
    return DEFAULT_SUPPORTED_SERVERS.has(baseName);
}
export function wrapWithLspmux(originalCommand, originalArgs, state) {
    if (!state.available || !state.running || !state.binaryPath) {
        return { command: originalCommand, args: originalArgs ?? [] };
    }
    if (!isLspmuxSupported(originalCommand)) {
        return { command: originalCommand, args: originalArgs ?? [] };
    }
    const baseName = originalCommand.split("/").pop() ?? originalCommand;
    const isDefaultRustAnalyzer = baseName === "rust-analyzer" && originalCommand === "rust-analyzer";
    const hasArgs = originalArgs && originalArgs.length > 0;
    if (isDefaultRustAnalyzer && !hasArgs) {
        return { command: state.binaryPath, args: [] };
    }
    const args = hasArgs ? ["client", "--", ...originalArgs] : ["client"];
    return {
        command: state.binaryPath,
        args,
        env: { LSPMUX_SERVER: originalCommand },
    };
}
export async function getLspmuxCommand(command, args) {
    const state = await detectLspmux();
    return wrapWithLspmux(command, args, state);
}
//# sourceMappingURL=lspmux.js.map