/**
 * Native clipboard access using N-API.
 *
 * Cross-platform clipboard read/write backed by the `arboard` Rust crate.
 * No external tools (pbcopy, xclip, etc.) required.
 */
import { native } from "../native.js";
/**
 * Copy plain text to the system clipboard.
 *
 * Runs synchronously to avoid macOS AppKit pasteboard warnings
 * when writing from worker threads.
 */
export function copyToClipboard(text) {
    native.copyToClipboard(text);
}
/**
 * Read plain text from the system clipboard.
 *
 * Returns `null` when no text data is available.
 */
export function readTextFromClipboard() {
    return native.readTextFromClipboard();
}
/**
 * Read an image from the system clipboard.
 *
 * Returns a Promise that resolves to a `ClipboardImage` (PNG-encoded bytes)
 * or `null` when no image data is available.
 */
export function readImageFromClipboard() {
    return native.readImageFromClipboard();
}
