/**
 * Native ripgrep wrapper using N-API.
 *
 * High-performance regex search backed by Rust's grep-* crates
 * (the same internals as ripgrep).
 */
import type { ContextLine, GrepMatch, GrepOptions, GrepResult, SearchMatch, SearchOptions, SearchResult } from "./types.js";
export type { ContextLine, GrepMatch, GrepOptions, GrepResult, SearchMatch, SearchOptions, SearchResult, };
/**
 * Search in-memory content for a regex pattern.
 *
 * Accepts a Buffer/Uint8Array of UTF-8 encoded content.
 */
export declare function searchContent(content: Buffer | Uint8Array, options: SearchOptions): SearchResult;
/**
 * Search files on disk for a regex pattern.
 *
 * Walks the directory tree respecting .gitignore and optional glob filters.
 * Runs on the native blocking worker pool and resolves asynchronously.
 */
export declare function grep(options: GrepOptions): Promise<GrepResult>;
