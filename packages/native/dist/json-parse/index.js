/**
 * Streaming JSON parser via native Rust bindings with JS fallback.
 *
 * Provides fast JSON parsing with recovery for incomplete/partial JSON,
 * used during LLM streaming tool call argument parsing.
 *
 * Falls back to pure-JS implementation when native functions are not
 * available (e.g. addon was compiled before json-parse was added).
 */
import { native } from "../native.js";
const hasNativeJson = typeof native.parseStreamingJson === "function";
/**
 * JS fallback: attempt JSON.parse, return {} on failure.
 */
function jsFallbackStreamingJson(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        // Try to salvage partial JSON by closing open structures
        let patched = text.trim();
        // Close unclosed strings
        const quotes = (patched.match(/"/g) || []).length;
        if (quotes % 2 !== 0)
            patched += '"';
        // Close unclosed brackets/braces
        const opens = (patched.match(/[{[]/g) || []).length;
        const closes = (patched.match(/[}\]]/g) || []).length;
        for (let i = 0; i < opens - closes; i++) {
            // Guess which closer based on last opener
            const lastOpen = patched.lastIndexOf("{") > patched.lastIndexOf("[") ? "}" : "]";
            patched += lastOpen;
        }
        try {
            return JSON.parse(patched);
        }
        catch {
            return {};
        }
    }
}
/**
 * Parse a complete JSON string. Throws on invalid JSON.
 */
export function parseJson(text) {
    if (hasNativeJson) {
        return native.parseJson(text);
    }
    return JSON.parse(text);
}
/**
 * Parse potentially incomplete JSON by closing unclosed structures.
 * Handles unclosed strings, objects, arrays, trailing commas, and truncated literals.
 */
export function parsePartialJson(text) {
    if (hasNativeJson) {
        return native.parsePartialJson(text);
    }
    return jsFallbackStreamingJson(text);
}
/**
 * Try full JSON parse first; fall back to partial parse.
 * Returns `{}` on total failure. Drop-in replacement for the JS streaming parser.
 */
export function parseStreamingJson(text) {
    if (!text || text.trim() === "") {
        return {};
    }
    if (hasNativeJson) {
        return native.parseStreamingJson(text);
    }
    return jsFallbackStreamingJson(text);
}
