import type { AgentTool } from "@gsd/pi-agent-core";
import { type Static } from "@sinclair/typebox";
import { type BashInterceptorRule } from "./bash-interceptor.js";
import { type TruncationResult } from "./truncate.js";
import type { ArtifactManager } from "../artifact-manager.js";
/**
 * Rewrite a command that uses & for backgrounding so the background process
 * does not inherit the bash tool's stdout/stderr pipes.
 *
 * Without this, `python -m http.server 8080 &` causes the bash tool to hang
 * indefinitely because Node.js keeps the pipe open until every process that
 * inherited it exits — including the long-running server.
 *
 * The rewrite adds `>/dev/null 2>&1` before each & where stdout is not already
 * redirected, ensuring the background process detaches from the pipes while
 * still producing a human-readable notice in the tool output.
 *
 * Returns { command: string; rewritten: boolean }.
 */
export declare function rewriteBackgroundCommand(command: string): {
    command: string;
    rewritten: boolean;
};
declare const bashSchema: import("@sinclair/typebox").TObject<{
    command: import("@sinclair/typebox").TString;
    timeout: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type BashToolInput = Static<typeof bashSchema>;
export interface BashToolDetails {
    truncation?: TruncationResult;
    fullOutputPath?: string;
    artifactId?: string;
}
/**
 * Pluggable operations for the bash tool.
 * Override these to delegate command execution to remote systems (e.g., SSH).
 */
export interface BashOperations {
    /**
     * Execute a command and stream output.
     * @param command - The command to execute
     * @param cwd - Working directory
     * @param options - Execution options
     * @returns Promise resolving to exit code (null if killed)
     */
    exec: (command: string, cwd: string, options: {
        onData: (data: Buffer) => void;
        signal?: AbortSignal;
        timeout?: number;
        env?: NodeJS.ProcessEnv;
    }) => Promise<{
        exitCode: number | null;
    }>;
}
export interface BashSpawnContext {
    command: string;
    cwd: string;
    env: NodeJS.ProcessEnv;
}
export type BashSpawnHook = (context: BashSpawnContext) => BashSpawnContext;
export interface BashToolOptions {
    /** Custom operations for command execution. Default: local shell */
    operations?: BashOperations;
    /** Command prefix prepended to every command (e.g., "shopt -s expand_aliases" for alias support) */
    commandPrefix?: string;
    /** Hook to adjust command, cwd, or env before execution */
    spawnHook?: BashSpawnHook;
    /** Session-scoped artifact storage. When provided, spills to artifact files instead of temp files. */
    artifactManager?: ArtifactManager;
    /** Bash interceptor configuration — blocks commands that duplicate dedicated tools */
    interceptor?: {
        enabled: boolean;
        rules?: BashInterceptorRule[];
    };
    /** Tool names available in the session, used by the interceptor to check if replacement tools exist */
    availableToolNames?: string[] | (() => string[]);
}
export declare function createBashTool(cwd: string, options?: BashToolOptions): AgentTool<typeof bashSchema>;
/** Default bash tool using process.cwd() - for backwards compatibility */
export declare const bashTool: AgentTool<import("@sinclair/typebox").TObject<{
    command: import("@sinclair/typebox").TString;
    timeout: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>, any>;
export {};
//# sourceMappingURL=bash.d.ts.map