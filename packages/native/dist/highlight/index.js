/**
 * Syntect-based syntax highlighting via N-API.
 *
 * Provides ANSI-colored output for code blocks using semantic scope matching
 * across 11 token categories.
 */
import { native } from "../native.js";
/**
 * Highlight source code and return ANSI-colored output.
 *
 * @param code - The source code to highlight
 * @param lang - Language identifier (e.g., "rust", "typescript", "python"), or null for plain text
 * @param colors - Theme colors as ANSI escape sequences
 * @returns Highlighted code with ANSI color codes
 */
export function highlightCode(code, lang, colors) {
    return native.highlightCode(code, lang, colors);
}
/**
 * Check if a language is supported for highlighting.
 *
 * Returns true if the language has either direct syntect support or a
 * fallback alias mapping.
 */
export function supportsLanguage(lang) {
    return native.supportsLanguage(lang);
}
/**
 * Get list of all supported language names from syntect's default syntax set.
 */
export function getSupportedLanguages() {
    return native.getSupportedLanguages();
}
