/**
 * Get the shared grapheme segmenter instance.
 */
export declare function getSegmenter(): Intl.Segmenter;
/**
 * Check if a character is whitespace.
 */
export declare function isWhitespaceChar(char: string): boolean;
/**
 * Check if a character is punctuation.
 */
export declare function isPunctuationChar(char: string): boolean;
/**
 * Extract ANSI escape sequences from a string at the given position.
 */
export declare function extractAnsiCode(str: string, pos: number): {
    code: string;
    length: number;
} | null;
/**
 * Calculate the visible width of a string in terminal columns.
 * Delegates to the native Rust implementation.
 */
export declare function visibleWidth(str: string): number;
/**
 * Wrap text with ANSI codes preserved.
 * Delegates to the native Rust implementation.
 *
 * @param text - Text to wrap (may contain ANSI codes and newlines)
 * @param width - Maximum visible width per line
 * @returns Array of wrapped lines (NOT padded to width)
 */
export declare function wrapTextWithAnsi(text: string, width: number): string[];
/**
 * Truncate text to fit within a maximum visible width, adding ellipsis if needed.
 * Optionally pad with spaces to reach exactly maxWidth.
 * Delegates to the native Rust implementation.
 *
 * @param text - Text to truncate (may contain ANSI codes)
 * @param maxWidth - Maximum visible width
 * @param ellipsis - Ellipsis string to append when truncating (default: "...")
 * @param pad - If true, pad result with spaces to exactly maxWidth (default: false)
 * @returns Truncated text, optionally padded to exactly maxWidth
 */
export declare function truncateToWidth(text: string, maxWidth: number, ellipsis?: string, pad?: boolean): string;
/**
 * Extract a range of visible columns from a line. Handles ANSI codes and wide chars.
 * @param strict - If true, exclude wide chars at boundary that would extend past the range
 */
export declare function sliceByColumn(line: string, startCol: number, length: number, strict?: boolean): string;
/** Like sliceByColumn but also returns the actual visible width of the result. */
export declare function sliceWithWidth(line: string, startCol: number, length: number, strict?: boolean): {
    text: string;
    width: number;
};
/**
 * Extract "before" and "after" segments from a line in a single pass.
 * Delegates to the native Rust implementation.
 */
export declare function extractSegments(line: string, beforeEnd: number, afterStart: number, afterLen: number, strictAfter?: boolean): {
    before: string;
    beforeWidth: number;
    after: string;
    afterWidth: number;
};
/**
 * Apply background color to a line, padding to full width.
 *
 * @param line - Line of text (may contain ANSI codes)
 * @param width - Total width to pad to
 * @param bgFn - Background color function
 * @returns Line with background applied and padded to width
 */
export declare function applyBackgroundToLine(line: string, width: number, bgFn: (text: string) => string): string;
//# sourceMappingURL=utils.d.ts.map