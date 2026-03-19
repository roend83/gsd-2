/**
 * Line-boundary-aware output truncation (native Rust).
 *
 * Truncates tool output at line boundaries, counting by UTF-8 bytes.
 * Three modes: head (keep end), tail (keep start), both (keep start+end).
 */
export interface TruncateResult {
    text: string;
    truncated: boolean;
    originalLines: number;
    keptLines: number;
}
export interface TruncateOutputResult {
    text: string;
    truncated: boolean;
    message?: string;
}
/**
 * Keep the first `maxBytes` worth of complete lines.
 */
export declare function truncateTail(text: string, maxBytes: number): TruncateResult;
/**
 * Keep the last `maxBytes` worth of complete lines.
 */
export declare function truncateHead(text: string, maxBytes: number): TruncateResult;
/**
 * Main entry point: truncate tool output with head/tail/both modes.
 */
export declare function truncateOutput(text: string, maxBytes: number, mode?: string): TruncateOutputResult;
