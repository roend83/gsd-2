/**
 * Native ripgrep wrapper using N-API.
 *
 * High-performance regex search backed by Rust's grep-* crates
 * (the same internals as ripgrep).
 */
import { native } from "../native.js";
/**
 * Search in-memory content for a regex pattern.
 *
 * Accepts a Buffer/Uint8Array of UTF-8 encoded content.
 */
export function searchContent(content, options) {
    return native.search(content, options);
}
/**
 * Search files on disk for a regex pattern.
 *
 * Walks the directory tree respecting .gitignore and optional glob filters.
 * Runs on the native blocking worker pool and resolves asynchronously.
 */
export function grep(options) {
    return native.grep(options);
}
