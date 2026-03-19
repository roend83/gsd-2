/**
 * HTML to Markdown conversion via native Rust bindings.
 *
 * Uses `html-to-markdown-rs` under the hood for high-performance
 * conversion with optional content cleaning (stripping nav, forms, etc.).
 */
import type { HtmlToMarkdownOptions } from "./types.js";
export type { HtmlToMarkdownOptions };
/**
 * Convert an HTML string to Markdown.
 *
 * When `cleanContent` is true, boilerplate elements (nav, forms, headers,
 * footers) are stripped before conversion.
 */
export declare function htmlToMarkdown(html: string, options?: HtmlToMarkdownOptions): string;
