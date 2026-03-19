/**
 * Resolves the entry-point file(s) for a single extension directory.
 *
 * 1. If the directory contains a package.json with a `pi.extensions` array,
 *    each entry is resolved relative to the directory and returned (if it exists).
 * 2. Otherwise falls back to `index.ts` → `index.js`.
 */
export declare function resolveExtensionEntries(dir: string): string[];
/**
 * Discovers all extension entry-point paths under an extensions directory.
 *
 * - Top-level .ts/.js files are treated as standalone extension entry points.
 * - Subdirectories are resolved via `resolveExtensionEntries()` (package.json →
 *   pi.extensions, then index.ts/index.js fallback).
 */
export declare function discoverExtensionEntryPaths(extensionsDir: string): string[];
