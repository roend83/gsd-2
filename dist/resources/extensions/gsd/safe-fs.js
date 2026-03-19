import { existsSync, mkdirSync, cpSync } from "node:fs";
import { dirname } from "node:path";
/**
 * Safely creates a directory. Returns true if successful, false on error.
 * Logs to stderr when GSD_DEBUG is set.
 */
export function safeMkdir(dirPath) {
    try {
        mkdirSync(dirPath, { recursive: true });
        return true;
    }
    catch (err) {
        if (process.env.GSD_DEBUG)
            console.error(`[gsd] mkdir failed: ${dirPath}`, err);
        return false;
    }
}
/**
 * Safely copies src to dst. Returns true if successful, false if src doesn't exist or copy fails.
 * Logs to stderr when GSD_DEBUG is set.
 */
export function safeCopy(src, dst, opts) {
    if (!existsSync(src))
        return false;
    try {
        cpSync(src, dst, opts);
        return true;
    }
    catch (err) {
        if (process.env.GSD_DEBUG)
            console.error(`[gsd] copy failed: ${src} → ${dst}`, err);
        return false;
    }
}
/**
 * Safely copies a directory recursively, creating the parent of dst if needed.
 * Returns true if successful.
 */
export function safeCopyRecursive(src, dst, opts) {
    if (!existsSync(src))
        return false;
    try {
        mkdirSync(dirname(dst), { recursive: true });
        cpSync(src, dst, { ...opts, recursive: true });
        return true;
    }
    catch (err) {
        if (process.env.GSD_DEBUG)
            console.error(`[gsd] recursive copy failed: ${src} → ${dst}`, err);
        return false;
    }
}
