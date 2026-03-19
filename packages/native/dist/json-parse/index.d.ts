/**
 * Streaming JSON parser via native Rust bindings with JS fallback.
 *
 * Provides fast JSON parsing with recovery for incomplete/partial JSON,
 * used during LLM streaming tool call argument parsing.
 *
 * Falls back to pure-JS implementation when native functions are not
 * available (e.g. addon was compiled before json-parse was added).
 */
/**
 * Parse a complete JSON string. Throws on invalid JSON.
 */
export declare function parseJson<T = unknown>(text: string): T;
/**
 * Parse potentially incomplete JSON by closing unclosed structures.
 * Handles unclosed strings, objects, arrays, trailing commas, and truncated literals.
 */
export declare function parsePartialJson<T = unknown>(text: string): T;
/**
 * Try full JSON parse first; fall back to partial parse.
 * Returns `{}` on total failure. Drop-in replacement for the JS streaming parser.
 */
export declare function parseStreamingJson<T = unknown>(text: string | undefined): T;
