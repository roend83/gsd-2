/**
 * Hashline edit mode — a line-addressable edit format using content-hash anchors.
 *
 * Each line in a file is identified by its 1-indexed line number and a short
 * hash derived from the normalized line text (xxHash32, truncated to 2 chars
 * from a custom nibble alphabet).
 *
 * The combined `LINE#ID` reference acts as both an address and a staleness check:
 * if the file has changed since the caller last read it, hash mismatches are caught
 * before any mutation occurs.
 *
 * Displayed format: `LINENUM#HASH:TEXT`
 * Reference format: `"LINENUM#HASH"` (e.g. `"5#QQ"`)
 *
 * Adapted from Oh My Pi's hashline implementation for Node.js (no Bun dependency).
 */
export type Anchor = {
    line: number;
    hash: string;
};
export type HashlineEdit = {
    op: "replace";
    pos: Anchor;
    end?: Anchor;
    lines: string[];
} | {
    op: "append";
    pos?: Anchor;
    lines: string[];
} | {
    op: "prepend";
    pos?: Anchor;
    lines: string[];
};
/**
 * Compute a short hash of a single line.
 *
 * Uses xxHash32 on a trailing-whitespace-trimmed, CR-stripped line, truncated to 2 chars
 * from the nibble alphabet. For lines containing no alphanumeric characters (only
 * punctuation/symbols/whitespace), the line number is mixed in to reduce hash collisions.
 */
export declare function computeLineHash(idx: number, line: string): string;
/**
 * Formats a tag given the line number and text.
 */
export declare function formatLineTag(line: number, text: string): string;
/**
 * Format file text with hashline prefixes for display.
 *
 * Each line becomes `LINENUM#HASH:TEXT` where LINENUM is 1-indexed.
 */
export declare function formatHashLines(text: string, startLine?: number): string;
/**
 * Parse a line reference string like `"5#QQ"` into structured form.
 *
 * @throws Error if the format is invalid
 */
export declare function parseTag(ref: string): Anchor;
export interface HashMismatch {
    line: number;
    expected: string;
    actual: string;
}
/**
 * Error thrown when one or more hashline references have stale hashes.
 * Displays grep-style output with `>>>` markers on mismatched lines,
 * showing the correct `LINE#ID` so the caller can fix all refs at once.
 */
export declare class HashlineMismatchError extends Error {
    readonly mismatches: HashMismatch[];
    readonly fileLines: string[];
    readonly remaps: ReadonlyMap<string, string>;
    constructor(mismatches: HashMismatch[], fileLines: string[]);
    static formatMessage(mismatches: HashMismatch[], fileLines: string[]): string;
}
/**
 * Validate that a line reference points to an existing line with a matching hash.
 */
export declare function validateLineRef(ref: Anchor, fileLines: string[]): void;
/**
 * Strip hashline display prefixes and diff `+` markers from replacement lines.
 *
 * Models frequently copy the `LINE#ID` prefix from read output into their
 * replacement content. This strips them heuristically before application.
 */
export declare function stripNewLinePrefixes(lines: string[]): string[];
/**
 * Parse edit content — handles string, array, or null input.
 * Strips hashline prefixes and diff markers from model output.
 */
export declare function parseHashlineText(edit: string[] | string | null): string[];
/**
 * Apply an array of hashline edits to file content.
 *
 * Each edit operation identifies target lines directly (`replace`,
 * `append`, `prepend`). Line references are resolved via parseTag
 * and hashes validated before any mutation.
 *
 * Edits are sorted bottom-up (highest effective line first) so earlier
 * splices don't invalidate later line numbers.
 *
 * @returns The modified content and the 1-indexed first changed line number
 */
export declare function applyHashlineEdits(text: string, edits: HashlineEdit[]): {
    lines: string;
    firstChangedLine: number | undefined;
    warnings?: string[];
    noopEdits?: Array<{
        editIndex: number;
        loc: string;
        current: string;
    }>;
};
//# sourceMappingURL=hashline.d.ts.map