/**
 * ANSI-aware text measurement and slicing.
 *
 * High-performance UTF-16 native implementation with ASCII fast-paths,
 * single-pass ANSI scanning, and proper Unicode grapheme cluster support.
 */
import type { ExtractSegmentsResult, SliceResult } from "./types.js";
export type { ExtractSegmentsResult, SliceResult };
export { EllipsisKind } from "./types.js";
/**
 * Word-wrap text to a visible width, preserving ANSI escape codes across
 * line breaks.
 *
 * Active SGR codes (colors, bold, etc.) are carried to continuation lines.
 * Underline and strikethrough are reset at line ends and restored on the
 * next line.
 */
export declare function wrapTextWithAnsi(text: string, width: number, tabWidth?: number): string[];
/**
 * Truncate text to a visible width with an optional ellipsis.
 *
 * @param text       Input string (may contain ANSI codes).
 * @param maxWidth   Maximum visible width in terminal cells.
 * @param ellipsisKind  0 = "\u2026", 1 = "...", 2 = none.
 * @param pad        When true, pad with spaces to exactly `maxWidth`.
 * @param tabWidth   Tab stop width (default 3, range 1-16).
 */
export declare function truncateToWidth(text: string, maxWidth: number, ellipsisKind: number, pad: boolean, tabWidth?: number): string;
/**
 * Slice a range of visible columns from a line.
 *
 * Counts terminal cells (skipping ANSI escapes). When `strict` is true,
 * wide characters that would exceed the range are excluded.
 */
export declare function sliceWithWidth(line: string, startCol: number, length: number, strict: boolean, tabWidth?: number): SliceResult;
/**
 * Extract the before/after segments around an overlay region.
 *
 * ANSI state is tracked so the `after` segment renders correctly even when
 * the overlay truncates styled text.
 */
export declare function extractSegments(line: string, beforeEnd: number, afterStart: number, afterLen: number, strictAfter: boolean, tabWidth?: number): ExtractSegmentsResult;
/**
 * Strip ANSI escape sequences, remove control characters and lone
 * surrogates, and normalize line endings (CR removed).
 *
 * Returns the original string when no changes are needed (zero-copy).
 */
export declare function sanitizeText(text: string): string;
/**
 * Calculate visible width of text excluding ANSI escape sequences.
 *
 * Tabs count as `tabWidth` cells (default 3).
 */
export declare function visibleWidth(text: string, tabWidth?: number): number;
