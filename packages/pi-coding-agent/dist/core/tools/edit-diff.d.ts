/**
 * Shared diff computation utilities for the edit tool.
 * Used by both edit.ts (for execution) and tool-execution.ts (for preview rendering).
 *
 * These helpers intentionally stay in JavaScript. Issue #453 showed that
 * post-tool preview paths must not depend on the native addon because a native
 * hang there can wedge the entire interactive session after a successful tool run.
 */
export declare function detectLineEnding(content: string): "\r\n" | "\n";
export declare function normalizeToLF(text: string): string;
export declare function restoreLineEndings(text: string, ending: "\r\n" | "\n"): string;
/**
 * Normalize text for fuzzy matching.
 * - Strip trailing whitespace from each line
 * - Normalize smart quotes to ASCII equivalents
 * - Normalize Unicode dashes/hyphens to ASCII hyphen
 * - Normalize special Unicode spaces to regular space
 */
export declare function normalizeForFuzzyMatch(text: string): string;
export interface FuzzyMatchResult {
    /** Whether a match was found */
    found: boolean;
    /** The index where the match starts (in the content that should be used for replacement) */
    index: number;
    /** Length of the matched text */
    matchLength: number;
    /** Whether fuzzy matching was used (false = exact match) */
    usedFuzzyMatch: boolean;
    /**
     * The content to use for replacement operations.
     * When exact match: original content. When fuzzy match: normalized content.
     */
    contentForReplacement: string;
}
/**
 * Find oldText in content, trying exact match first, then fuzzy match.
 *
 * When fuzzy matching is used, the returned contentForReplacement is the
 * fuzzy-normalized version of the content.
 */
export declare function fuzzyFindText(content: string, oldText: string): FuzzyMatchResult;
/** Strip UTF-8 BOM if present, return both the BOM (if any) and the text without it */
export declare function stripBom(content: string): {
    bom: string;
    text: string;
};
/**
 * Generate a unified diff string with line numbers and context.
 *
 * Returns both the diff string and the first changed line number (in the new file).
 * Only lines within `contextLines` of a change are included (like unified diff).
 */
export declare function generateDiffString(oldContent: string, newContent: string, contextLines?: number): {
    diff: string;
    firstChangedLine: number | undefined;
};
export interface EditDiffResult {
    diff: string;
    firstChangedLine: number | undefined;
}
export interface EditDiffError {
    error: string;
}
/**
 * Compute the diff for an edit operation without applying it.
 * Used for preview rendering in the TUI before the tool executes.
 */
export declare function computeEditDiff(path: string, oldText: string, newText: string, cwd: string): Promise<EditDiffResult | EditDiffError>;
//# sourceMappingURL=edit-diff.d.ts.map