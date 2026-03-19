/**
 * Native clipboard access using N-API.
 *
 * Cross-platform clipboard read/write backed by the `arboard` Rust crate.
 * No external tools (pbcopy, xclip, etc.) required.
 */
import type { ClipboardImage } from "./types.js";
export type { ClipboardImage };
/**
 * Copy plain text to the system clipboard.
 *
 * Runs synchronously to avoid macOS AppKit pasteboard warnings
 * when writing from worker threads.
 */
export declare function copyToClipboard(text: string): void;
/**
 * Read plain text from the system clipboard.
 *
 * Returns `null` when no text data is available.
 */
export declare function readTextFromClipboard(): string | null;
/**
 * Read an image from the system clipboard.
 *
 * Returns a Promise that resolves to a `ClipboardImage` (PNG-encoded bytes)
 * or `null` when no image data is available.
 */
export declare function readImageFromClipboard(): Promise<ClipboardImage | null>;
