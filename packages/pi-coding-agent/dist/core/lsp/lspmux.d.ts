/**
 * lspmux integration for LSP server multiplexing.
 *
 * When lspmux is available and running, this module wraps supported LSP server
 * commands to use lspmux client mode, enabling server instance sharing across
 * multiple editor windows.
 *
 * Integration is transparent: if lspmux is unavailable, falls back to direct spawning.
 */
interface LspmuxConfig {
    instance_timeout?: number;
    gc_interval?: number;
    listen?: [string, number] | string;
    connect?: [string, number] | string;
    log_filters?: string;
    pass_environment?: string[];
}
interface LspmuxState {
    available: boolean;
    running: boolean;
    binaryPath: string | null;
    config: LspmuxConfig | null;
}
export declare function detectLspmux(): Promise<LspmuxState>;
export declare function isLspmuxSupported(command: string): boolean;
export interface LspmuxWrappedCommand {
    command: string;
    args: string[];
    env?: Record<string, string>;
}
export declare function wrapWithLspmux(originalCommand: string, originalArgs: string[] | undefined, state: LspmuxState): LspmuxWrappedCommand;
export declare function getLspmuxCommand(command: string, args?: string[]): Promise<LspmuxWrappedCommand>;
export {};
//# sourceMappingURL=lspmux.d.ts.map