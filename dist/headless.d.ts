/**
 * Headless Orchestrator — `gsd headless`
 *
 * Runs any /gsd subcommand without a TUI by spawning a child process in
 * RPC mode, auto-responding to extension UI requests, and streaming
 * progress to stderr.
 *
 * Exit codes:
 *   0 — complete (command finished successfully)
 *   1 — error or timeout
 *   2 — blocked (command reported a blocker)
 */
export interface HeadlessOptions {
    timeout: number;
    json: boolean;
    model?: string;
    command: string;
    commandArgs: string[];
    context?: string;
    contextText?: string;
    auto?: boolean;
    verbose?: boolean;
    maxRestarts?: number;
    supervised?: boolean;
    responseTimeout?: number;
    answers?: string;
    eventFilter?: Set<string>;
}
export declare function parseHeadlessArgs(argv: string[]): HeadlessOptions;
export declare function runHeadless(options: HeadlessOptions): Promise<void>;
