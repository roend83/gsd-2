/**
 * Native fuzzy text matching and diff generation for the edit tool.
 *
 * Uses the `similar` Rust crate (Myers' algorithm) for O(n+d) diffing,
 * and single-pass Unicode normalization for fuzzy matching.
 */
import { native } from "../native.js";
/**
 * Normalize text for fuzzy matching:
 * - Strip trailing whitespace from each line
 * - Smart quotes to ASCII equivalents
 * - Unicode dashes/hyphens to ASCII hyphen
 * - Special Unicode spaces to regular space
 */
export function normalizeForFuzzyMatch(text) {
    return native.normalizeForFuzzyMatch(text);
}
/**
 * Find `oldText` in `content`, trying exact match first, then fuzzy match.
 *
 * When fuzzy matching is used, `contentForReplacement` is the normalized
 * version of `content`.
 */
export function fuzzyFindText(content, oldText) {
    return native.fuzzyFindText(content, oldText);
}
/**
 * Generate a unified diff string with line numbers and context.
 *
 * Uses Myers' diff algorithm via the `similar` Rust crate.
 *
 * @param oldContent  Original text
 * @param newContent  Modified text
 * @param contextLines  Number of context lines around changes (default: 4)
 */
export function generateDiff(oldContent, newContent, contextLines) {
    return native.generateDiff(oldContent, newContent, contextLines);
}
