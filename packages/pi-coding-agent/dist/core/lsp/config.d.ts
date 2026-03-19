import type { ServerConfig } from "./types.js";
export interface LspConfig {
    servers: Record<string, ServerConfig>;
    /** Idle timeout in milliseconds. If set, LSP clients will be shutdown after this period of inactivity. Disabled by default. */
    idleTimeoutMs?: number;
}
export declare function hasRootMarkers(cwd: string, markers: string[]): boolean;
export declare function resolveCommand(command: string, cwd: string): string | null;
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
export declare function loadConfig(cwd: string): LspConfig;
export declare function getServersForFile(config: LspConfig, filePath: string): Array<[string, ServerConfig]>;
export declare function getServerForFile(config: LspConfig, filePath: string): [string, ServerConfig] | null;
export declare function hasCapability(config: ServerConfig, capability: keyof NonNullable<ServerConfig["capabilities"]>): boolean;
//# sourceMappingURL=config.d.ts.map