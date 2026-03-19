export declare const UNICODE_SPACES: RegExp;
export declare function expandPath(filePath: string): string;
/**
 * Resolve a path relative to the given cwd.
 * Handles ~ expansion, MSYS-style paths on Windows, and absolute paths.
 */
export declare function resolveToCwd(filePath: string, cwd: string): string;
export declare function resolveReadPath(filePath: string, cwd: string): string;
//# sourceMappingURL=path-utils.d.ts.map