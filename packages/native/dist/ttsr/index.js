/**
 * Native TTSR regex engine.
 *
 * Pre-compiles all rule condition patterns into a single Rust RegexSet for
 * O(1)-style matching per buffer check, replacing per-rule JS regex iteration.
 */
import { native } from "../native.js";
/**
 * Compile TTSR rules into an optimized native regex engine.
 *
 * Returns an opaque handle for use with `ttsrCheckBuffer` and `ttsrFreeRules`.
 */
export function ttsrCompileRules(rules) {
    return native.ttsrCompileRules(rules);
}
/**
 * Check a buffer against compiled TTSR rules.
 *
 * Returns an array of unique rule names whose conditions matched.
 * All patterns are tested in a single pass via Rust's RegexSet.
 */
export function ttsrCheckBuffer(handle, buffer) {
    return native.ttsrCheckBuffer(handle, buffer);
}
/**
 * Free a compiled TTSR rule set, releasing native memory.
 *
 * Call when rules are no longer needed (e.g., session end).
 */
export function ttsrFreeRules(handle) {
    native.ttsrFreeRules(handle);
}
