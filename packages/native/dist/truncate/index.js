/**
 * Line-boundary-aware output truncation (native Rust).
 *
 * Truncates tool output at line boundaries, counting by UTF-8 bytes.
 * Three modes: head (keep end), tail (keep start), both (keep start+end).
 */
import { native } from "../native.js";
/**
 * Keep the first `maxBytes` worth of complete lines.
 */
export function truncateTail(text, maxBytes) {
    return native.truncateTail(text, maxBytes);
}
/**
 * Keep the last `maxBytes` worth of complete lines.
 */
export function truncateHead(text, maxBytes) {
    return native.truncateHead(text, maxBytes);
}
/**
 * Main entry point: truncate tool output with head/tail/both modes.
 */
export function truncateOutput(text, maxBytes, mode) {
    return native.truncateOutput(text, maxBytes, mode);
}
