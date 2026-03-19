import * as fs from "node:fs";
import { createRequire } from "node:module";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import YAML from "yaml";
import { globSync } from "glob";
import { CONFIG_DIR_NAME } from "../../config.js";
import { isRecord } from "./helpers.js";
const require = createRequire(import.meta.url);
const DEFAULTS = require("./defaults.json");
// =============================================================================
// Default Server Configuration Loading
// =============================================================================
const PID_TOKEN = "$PID";
function parseConfigContent(content, filePath) {
    const extension = path.extname(filePath).toLowerCase();
    if (extension === ".yaml" || extension === ".yml") {
        return YAML.parse(content);
    }
    return JSON.parse(content);
}
function normalizeConfig(value) {
    if (!isRecord(value))
        return null;
    const idleTimeoutMs = typeof value.idleTimeoutMs === "number" ? value.idleTimeoutMs : undefined;
    const rawServers = value.servers;
    if (isRecord(rawServers)) {
        return { servers: rawServers, idleTimeoutMs };
    }
    const servers = Object.fromEntries(Object.entries(value).filter(([key]) => key !== "idleTimeoutMs"));
    return { servers, idleTimeoutMs };
}
function normalizeStringArray(value) {
    if (!Array.isArray(value))
        return null;
    const items = value.filter((entry) => typeof entry === "string" && entry.length > 0);
    return items.length > 0 ? items : null;
}
function normalizeServerConfig(name, config) {
    const command = typeof config.command === "string" && config.command.length > 0 ? config.command : null;
    const fileTypes = normalizeStringArray(config.fileTypes);
    const rootMarkers = normalizeStringArray(config.rootMarkers);
    if (!command || !fileTypes || !rootMarkers) {
        return null;
    }
    const args = Array.isArray(config.args)
        ? config.args.filter((entry) => typeof entry === "string")
        : undefined;
    return {
        ...config,
        command,
        args,
        fileTypes,
        rootMarkers,
    };
}
function readConfigFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const parsed = parseConfigContent(content, filePath);
        return normalizeConfig(parsed);
    }
    catch {
        return null;
    }
}
function coerceServerConfigs(servers) {
    const result = {};
    for (const [name, config] of Object.entries(servers)) {
        const normalized = normalizeServerConfig(name, config);
        if (normalized) {
            result[name] = normalized;
        }
    }
    return result;
}
function mergeServers(base, overrides) {
    const merged = { ...base };
    for (const [name, config] of Object.entries(overrides)) {
        if (merged[name]) {
            const candidate = { ...merged[name], ...config };
            const normalized = normalizeServerConfig(name, candidate);
            if (normalized) {
                merged[name] = normalized;
            }
        }
        else {
            const normalized = normalizeServerConfig(name, config);
            if (normalized) {
                merged[name] = normalized;
            }
        }
    }
    return merged;
}
function applyRuntimeDefaults(servers) {
    const updated = { ...servers };
    if (updated.omnisharp?.args) {
        const args = updated.omnisharp.args.map((arg) => (arg === PID_TOKEN ? String(process.pid) : arg));
        updated.omnisharp = { ...updated.omnisharp, args };
    }
    return updated;
}
// =============================================================================
// Configuration Loading
// =============================================================================
export function hasRootMarkers(cwd, markers) {
    for (const marker of markers) {
        if (marker.includes("*")) {
            try {
                const matches = globSync(marker, { cwd, nodir: false });
                if (matches.length > 0) {
                    return true;
                }
            }
            catch {
                // Failed to resolve glob root marker
            }
            continue;
        }
        const filePath = path.join(cwd, marker);
        if (fs.existsSync(filePath)) {
            return true;
        }
    }
    return false;
}
// =============================================================================
// Local Binary Resolution
// =============================================================================
const LOCAL_BIN_PATHS = [
    { markers: ["package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"], binDir: "node_modules/.bin" },
    { markers: ["pyproject.toml", "requirements.txt", "setup.py", "Pipfile"], binDir: ".venv/bin" },
    { markers: ["pyproject.toml", "requirements.txt", "setup.py", "Pipfile"], binDir: "venv/bin" },
    { markers: ["pyproject.toml", "requirements.txt", "setup.py", "Pipfile"], binDir: ".env/bin" },
    { markers: ["Gemfile", "Gemfile.lock"], binDir: "vendor/bundle/bin" },
    { markers: ["Gemfile", "Gemfile.lock"], binDir: "bin" },
    { markers: ["go.mod", "go.sum"], binDir: "bin" },
];
function which(command) {
    // On Windows, prefer `where.exe` over `which` — MSYS/Git Bash's `which`
    // returns POSIX paths (/c/Users/...) that Node's spawn() can't execute.
    // `where.exe` returns native Windows paths (C:\Users\...).
    const isWindows = process.platform === "win32";
    const cmd = isWindows ? "where.exe" : "which";
    const result = spawnSync(cmd, [command], { encoding: "utf-8", shell: isWindows });
    if (result.status !== 0)
        return null;
    // `where.exe` may return multiple lines — take the first
    const resolved = result.stdout.trim().split(/\r?\n/)[0]?.trim();
    return resolved || null;
}
export function resolveCommand(command, cwd) {
    for (const { markers, binDir } of LOCAL_BIN_PATHS) {
        if (hasRootMarkers(cwd, markers)) {
            const localPath = path.join(cwd, binDir, command);
            if (fs.existsSync(localPath)) {
                return localPath;
            }
        }
    }
    return which(command);
}
/**
 * Configuration file search paths (in priority order).
 */
function getConfigPaths(cwd) {
    const filenames = ["lsp.json", ".lsp.json", "lsp.yaml", ".lsp.yaml", "lsp.yml", ".lsp.yml"];
    const paths = [];
    // Project root files (highest priority)
    for (const filename of filenames) {
        paths.push(path.join(cwd, filename));
    }
    // Project config directory
    const projectConfigDir = path.join(cwd, CONFIG_DIR_NAME);
    for (const filename of filenames) {
        paths.push(path.join(projectConfigDir, filename));
    }
    // User config directory
    const userConfigDir = path.join(os.homedir(), CONFIG_DIR_NAME, "agent");
    for (const filename of filenames) {
        paths.push(path.join(userConfigDir, filename));
    }
    // User home root files (lowest priority fallback)
    for (const filename of filenames) {
        paths.push(path.join(os.homedir(), filename));
    }
    return paths;
}
/**
 * Load LSP configuration.
 *
 * Priority (highest to lowest):
 * 1. Project root: lsp.json/.lsp.json/lsp.yml/.lsp.yml/lsp.yaml/.lsp.yaml
 * 2. Project config dir: {CONFIG_DIR_NAME}/lsp.* (+ hidden variants)
 * 3. User config dir: ~/{CONFIG_DIR_NAME}/agent/lsp.* (+ hidden variants)
 * 4. User home root: ~/lsp.*, ~/.lsp.*
 * 5. Auto-detect from project markers + available binaries
 */
export function loadConfig(cwd) {
    let mergedServers = coerceServerConfigs(DEFAULTS);
    const configPaths = getConfigPaths(cwd).reverse();
    let hasOverrides = false;
    let idleTimeoutMs;
    for (const configPath of configPaths) {
        const parsed = readConfigFile(configPath);
        if (!parsed)
            continue;
        const hasServerOverrides = Object.keys(parsed.servers).length > 0;
        if (hasServerOverrides) {
            hasOverrides = true;
            mergedServers = mergeServers(mergedServers, parsed.servers);
        }
        if (parsed.idleTimeoutMs !== undefined) {
            idleTimeoutMs = parsed.idleTimeoutMs;
        }
    }
    if (!hasOverrides) {
        const detected = {};
        const defaultsWithRuntime = applyRuntimeDefaults(mergedServers);
        for (const [name, config] of Object.entries(defaultsWithRuntime)) {
            if (!hasRootMarkers(cwd, config.rootMarkers))
                continue;
            const resolved = resolveCommand(config.command, cwd);
            if (!resolved)
                continue;
            detected[name] = { ...config, resolvedCommand: resolved };
        }
        return { servers: detected, idleTimeoutMs };
    }
    const mergedWithRuntime = applyRuntimeDefaults(mergedServers);
    const available = {};
    for (const [name, config] of Object.entries(mergedWithRuntime)) {
        if (config.disabled)
            continue;
        const resolved = resolveCommand(config.command, cwd);
        if (!resolved)
            continue;
        available[name] = { ...config, resolvedCommand: resolved };
    }
    return { servers: available, idleTimeoutMs };
}
// =============================================================================
// Server Selection
// =============================================================================
export function getServersForFile(config, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath).toLowerCase();
    const matches = [];
    for (const [name, serverConfig] of Object.entries(config.servers)) {
        const supportsFile = serverConfig.fileTypes.some(fileType => {
            const normalized = fileType.toLowerCase();
            return normalized === ext || normalized === fileName;
        });
        if (supportsFile) {
            matches.push([name, serverConfig]);
        }
    }
    // Sort: primary servers (non-linters) first, then linters
    return matches.sort((a, b) => {
        const aIsLinter = a[1].isLinter ? 1 : 0;
        const bIsLinter = b[1].isLinter ? 1 : 0;
        return aIsLinter - bIsLinter;
    });
}
export function getServerForFile(config, filePath) {
    const servers = getServersForFile(config, filePath);
    return servers.length > 0 ? servers[0] : null;
}
export function hasCapability(config, capability) {
    return config.capabilities?.[capability] === true;
}
//# sourceMappingURL=config.js.map