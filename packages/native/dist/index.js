/**
 * @gsd/native — High-performance Rust modules exposed via N-API.
 *
 * Modules:
 * - clipboard: native clipboard access (text + image)
 * - grep: ripgrep-backed regex search (content + filesystem)
 * - ps: cross-platform process tree management
 * - glob: gitignore-respecting filesystem discovery with scan caching
 * - highlight: syntect-based syntax highlighting
 * - html: HTML to Markdown conversion
 * - text: ANSI-aware text measurement and slicing
 * - fd: fuzzy file path discovery
 * - image: decode, encode, and resize images
 for autocomplete and @-mention resolution
 */
export { copyToClipboard, readTextFromClipboard, readImageFromClipboard, } from "./clipboard/index.js";
export { highlightCode, supportsLanguage, getSupportedLanguages, } from "./highlight/index.js";
export { searchContent, grep } from "./grep/index.js";
export { killTree, listDescendants, processGroupId, killProcessGroup, } from "./ps/index.js";
export { glob, invalidateFsScanCache } from "./glob/index.js";
export { astGrep, astEdit } from "./ast/index.js";
export { htmlToMarkdown } from "./html/index.js";
export { wrapTextWithAnsi, truncateToWidth, sliceWithWidth, extractSegments, sanitizeText, visibleWidth, EllipsisKind, } from "./text/index.js";
export { normalizeForFuzzyMatch, fuzzyFindText, generateDiff, } from "./diff/index.js";
export { fuzzyFind } from "./fd/index.js";
export { parseImage, ImageFormat, SamplingFilter } from "./image/index.js";
export { xxHash32, xxHash32Fallback } from "./xxhash/index.js";
export { ttsrCompileRules, ttsrCheckBuffer, ttsrFreeRules } from "./ttsr/index.js";
export { parseJson, parsePartialJson, parseStreamingJson, } from "./json-parse/index.js";
export { processStreamChunk, stripAnsiNative, sanitizeBinaryOutputNative, } from "./stream-process/index.js";
export { parseFrontmatter, extractSection as nativeExtractSection, extractAllSections, batchParseGsdFiles, parseRoadmapFile, } from "./gsd-parser/index.js";
export { truncateTail, truncateHead, truncateOutput } from "./truncate/index.js";
