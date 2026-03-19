/**
 * Get shell configuration based on platform.
 * Resolution order:
 * 1. User-specified shellPath in settings.json
 * 2. On Windows: Git Bash in known locations, then bash on PATH
 * 3. On Unix: /bin/bash, then bash on PATH, then fallback to sh
 */
export declare function getShellConfig(): {
    shell: string;
    args: string[];
};
/**
 * On Windows + Git Bash, rewrite Windows-style NUL redirects to /dev/null.
 * Git Bash doesn't recognize NUL as a device name and creates a literal file
 * that is undeletable due to NUL being a reserved Windows device name.
 * No-op on non-Windows platforms.
 */
export declare function sanitizeCommand(command: string): string;
export declare function getShellEnv(): NodeJS.ProcessEnv;
/**
 * Sanitize binary output for display/storage.
 * Removes characters that crash string-width or cause display issues:
 * - Control characters (except tab, newline, carriage return)
 * - Lone surrogates
 * - Unicode Format characters (crash string-width due to a bug)
 * - Characters with undefined code points
 */
export declare function sanitizeBinaryOutput(str: string): string;
/**
 * Kill a process and all its children (cross-platform)
 */
export declare function killProcessTree(pid: number): void;
//# sourceMappingURL=shell.d.ts.map