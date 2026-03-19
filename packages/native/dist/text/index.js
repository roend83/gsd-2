/**
 * ANSI-aware text measurement and slicing.
 *
 * High-performance UTF-16 native implementation with ASCII fast-paths,
 * single-pass ANSI scanning, and proper Unicode grapheme cluster support.
 */
import { native } from "../native.js";
export { EllipsisKind } from "./types.js";
/**
 * Word-wrap text to a visible width, preserving ANSI escape codes across
 * line breaks.
 *
 * Active SGR codes (colors, bold, etc.) are carried to continuation lines.
 * Underline and strikethrough are reset at line ends and restored on the
 * next line.
 */
export function wrapTextWithAnsi(text, width, tabWidth) {
    return native.wrapTextWithAnsi(text, width, tabWidth);
}
/**
 * Truncate text to a visible width with an optional ellipsis.
 *
 * @param text       Input string (may contain ANSI codes).
 * @param maxWidth   Maximum visible width in terminal cells.
 * @param ellipsisKind  0 = "\u2026", 1 = "...", 2 = none.
 * @param pad        When true, pad with spaces to exactly `maxWidth`.
 * @param tabWidth   Tab stop width (default 3, range 1-16).
 */
export function truncateToWidth(text, maxWidth, ellipsisKind, pad, tabWidth) {
    return native.truncateToWidth(text, maxWidth, ellipsisKind, pad, tabWidth);
}
/**
 * Slice a range of visible columns from a line.
 *
 * Counts terminal cells (skipping ANSI escapes). When `strict` is true,
 * wide characters that would exceed the range are excluded.
 */
export function sliceWithWidth(line, startCol, length, strict, tabWidth) {
    return native.sliceWithWidth(line, startCol, length, strict, tabWidth);
}
/**
 * Extract the before/after segments around an overlay region.
 *
 * ANSI state is tracked so the `after` segment renders correctly even when
 * the overlay truncates styled text.
 */
export function extractSegments(line, beforeEnd, afterStart, afterLen, strictAfter, tabWidth) {
    return native.extractSegments(line, beforeEnd, afterStart, afterLen, strictAfter, tabWidth);
}
/**
 * Strip ANSI escape sequences, remove control characters and lone
 * surrogates, and normalize line endings (CR removed).
 *
 * Returns the original string when no changes are needed (zero-copy).
 */
export function sanitizeText(text) {
    return native.sanitizeText(text);
}
/**
 * Calculate visible width of text excluding ANSI escape sequences.
 *
 * Tabs count as `tabWidth` cells (default 3).
 */
export function visibleWidth(text, tabWidth) {
    return native.visibleWidth(text, tabWidth);
}
