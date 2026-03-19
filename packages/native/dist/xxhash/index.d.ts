/**
 * Native xxHash32 — Rust implementation via napi-rs, with a pure-JS fallback.
 *
 * Hashes the UTF-8 representation of the input string with the given seed.
 */
/**
 * Pure-JS xxHash32 implementation. Exposed for testing to allow CI to validate
 * the fallback path independently of native addon availability.
 */
export declare function xxHash32Fallback(input: string, seed: number): number;
/**
 * Compute xxHash32 of a UTF-8 string.
 *
 * Uses the native Rust implementation when available; falls back to a
 * pure-JS implementation if the loaded native addon does not export
 * `xxHash32` (e.g. an older build).
 *
 * @param input  The string to hash (encoded as UTF-8 internally).
 * @param seed   32-bit seed value.
 * @returns      32-bit unsigned hash.
 */
export declare function xxHash32(input: string, seed: number): number;
