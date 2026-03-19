/**
 * Bash stream processor — single-pass UTF-8 decode + ANSI strip + binary sanitization.
 *
 * Handles chunk boundaries for incomplete UTF-8 and ANSI escape sequences.
 */
export interface StreamState {
    utf8Pending: number[];
    ansiPending: number[];
}
export interface StreamChunkResult {
    text: string;
    state: StreamState;
}
/**
 * Process a raw bash output chunk in a single pass.
 *
 * Decodes UTF-8 (handling incomplete multibyte sequences at boundaries),
 * strips ANSI escape sequences, removes control characters (except tab and
 * newline), removes carriage returns, and filters Unicode format characters.
 *
 * Pass the returned `state` to the next call to handle sequences split
 * across chunk boundaries.
 */
export declare function processStreamChunk(chunk: Buffer, state?: StreamState): StreamChunkResult;
/**
 * Strip ANSI escape sequences from a string.
 */
export declare function stripAnsiNative(text: string): string;
/**
 * Remove binary garbage and control characters from a string.
 *
 * Keeps tab and newline. Removes carriage return, all other control
 * characters, Unicode format characters (U+FFF9-U+FFFB), and lone surrogates.
 */
export declare function sanitizeBinaryOutputNative(text: string): string;
