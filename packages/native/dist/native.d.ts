/**
 * Native addon loader.
 *
 * Locates and loads the compiled Rust N-API addon (`.node` file).
 * Resolution order:
 *   1. @gsd-build/engine-{platform} npm optional dependency (production install)
 *   2. native/addon/gsd_engine.{platform}.node (local release build)
 *   3. native/addon/gsd_engine.dev.node (local debug build)
 */
export declare const native: {
    search: (content: Buffer | Uint8Array, options: unknown) => unknown;
    grep: (options: unknown) => unknown;
    killTree: (pid: number, signal: number) => number;
    listDescendants: (pid: number) => number[];
    processGroupId: (pid: number) => number | null;
    killProcessGroup: (pgid: number, signal: number) => boolean;
    glob: (options: unknown, onMatch?: ((match: unknown) => void) | undefined | null) => Promise<unknown>;
    invalidateFsScanCache: (path?: string) => void;
    highlightCode: (code: string, lang: string | null, colors: unknown) => unknown;
    supportsLanguage: (lang: string) => unknown;
    getSupportedLanguages: () => unknown;
    copyToClipboard: (text: string) => void;
    readTextFromClipboard: () => string | null;
    readImageFromClipboard: () => Promise<unknown>;
    astGrep: (options: unknown) => unknown;
    astEdit: (options: unknown) => unknown;
    htmlToMarkdown: (html: string, options: unknown) => unknown;
    wrapTextWithAnsi: (text: string, width: number, tabWidth?: number) => string[];
    truncateToWidth: (text: string, maxWidth: number, ellipsisKind: number, pad: boolean, tabWidth?: number) => string;
    sliceWithWidth: (line: string, startCol: number, length: number, strict: boolean, tabWidth?: number) => unknown;
    extractSegments: (line: string, beforeEnd: number, afterStart: number, afterLen: number, strictAfter: boolean, tabWidth?: number) => unknown;
    sanitizeText: (text: string) => string;
    visibleWidth: (text: string, tabWidth?: number) => number;
    fuzzyFind: (options: unknown) => unknown;
    normalizeForFuzzyMatch: (text: string) => string;
    fuzzyFindText: (content: string, oldText: string) => unknown;
    generateDiff: (oldContent: string, newContent: string, contextLines?: number) => unknown;
    NativeImage: unknown;
    ttsrCompileRules: (rules: unknown[]) => number;
    ttsrCheckBuffer: (handle: number, buffer: string) => string[];
    ttsrFreeRules: (handle: number) => void;
    processStreamChunk: (chunk: Buffer, state?: unknown) => unknown;
    stripAnsiNative: (text: string) => string;
    sanitizeBinaryOutputNative: (text: string) => string;
    parseFrontmatter: (content: string) => unknown;
    extractSection: (content: string, heading: string, level?: number) => unknown;
    extractAllSections: (content: string, level?: number) => string;
    batchParseGsdFiles: (directory: string) => unknown;
    parseRoadmapFile: (content: string) => unknown;
    truncateTail: (text: string, maxBytes: number) => unknown;
    truncateHead: (text: string, maxBytes: number) => unknown;
    truncateOutput: (text: string, maxBytes: number, mode?: string) => unknown;
    parseJson: (text: string) => unknown;
    parsePartialJson: (text: string) => unknown;
    parseStreamingJson: (text: string) => unknown;
    xxHash32: (input: string, seed: number) => number;
};
/** True when the native addon loaded successfully. False on unsupported platforms. */
export declare const nativeAvailable = false;
