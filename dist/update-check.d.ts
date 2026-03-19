interface UpdateCheckCache {
    lastCheck: number;
    latestVersion: string;
}
/**
 * Compares two semver strings. Returns 1 if a > b, -1 if a < b, 0 if equal.
 */
export declare function compareSemver(a: string, b: string): number;
export declare function readUpdateCache(cachePath?: string): UpdateCheckCache | null;
export declare function writeUpdateCache(cache: UpdateCheckCache, cachePath?: string): void;
export interface UpdateCheckOptions {
    currentVersion?: string;
    cachePath?: string;
    registryUrl?: string;
    checkIntervalMs?: number;
    fetchTimeoutMs?: number;
    onUpdate?: (current: string, latest: string) => void;
}
/**
 * Non-blocking update check. Queries npm registry at most once per 24h,
 * caches the result, and prints a banner if a newer version is available.
 */
export declare function checkForUpdates(options?: UpdateCheckOptions): Promise<void>;
/**
 * Interactive update prompt shown at startup when a newer version is available.
 * Fetches the latest version (with cache), then asks the user whether to
 * update now or skip. Runs at most once per 24 hours (same cache as checkForUpdates).
 * Defaults to skip after 30 seconds of inactivity.
 *
 * Returns true if an update was performed, false otherwise.
 */
export declare function checkAndPromptForUpdates(options?: UpdateCheckOptions): Promise<boolean>;
export {};
