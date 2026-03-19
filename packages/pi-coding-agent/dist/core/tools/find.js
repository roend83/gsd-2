import { glob as nativeGlob } from "@gsd/native/glob";
import { Type } from "@sinclair/typebox";
import { existsSync } from "fs";
import path from "path";
import { FIND_DEFAULT_LIMIT } from "../constants.js";
import { resolveToCwd } from "./path-utils.js";
import { DEFAULT_MAX_BYTES, formatSize, truncateHead } from "./truncate.js";
const findSchema = Type.Object({
    pattern: Type.String({
        description: "Glob pattern to match files, e.g. '*.ts', '**/*.json', or 'src/**/*.spec.ts'",
    }),
    path: Type.Optional(Type.String({ description: "Directory to search in (default: current directory)" })),
    limit: Type.Optional(Type.Number({ description: "Maximum number of results (default: 1000)" })),
});
const DEFAULT_LIMIT = FIND_DEFAULT_LIMIT;
const defaultFindOperations = {
    exists: existsSync,
    glob: (_pattern, _searchCwd, _options) => {
        // Placeholder — actual native glob execution happens in execute
        return [];
    },
};
export function createFindTool(cwd, options) {
    const customOps = options?.operations;
    return {
        name: "find",
        label: "find",
        description: `Search for files by glob pattern. Returns matching file paths relative to the search directory. Respects .gitignore. Output is truncated to ${DEFAULT_LIMIT} results or ${DEFAULT_MAX_BYTES / 1024}KB (whichever is hit first).`,
        parameters: findSchema,
        execute: async (_toolCallId, { pattern, path: searchDir, limit }, signal) => {
            return new Promise((resolve, reject) => {
                if (signal?.aborted) {
                    reject(new Error("Operation aborted"));
                    return;
                }
                const onAbort = () => reject(new Error("Operation aborted"));
                signal?.addEventListener("abort", onAbort, { once: true });
                (async () => {
                    try {
                        const searchPath = resolveToCwd(searchDir || ".", cwd);
                        const effectiveLimit = limit ?? DEFAULT_LIMIT;
                        const ops = customOps ?? defaultFindOperations;
                        // If custom operations provided with glob, use that
                        if (customOps?.glob) {
                            if (!(await ops.exists(searchPath))) {
                                reject(new Error(`Path not found: ${searchPath}`));
                                return;
                            }
                            const results = await ops.glob(pattern, searchPath, {
                                ignore: ["**/node_modules/**", "**/.git/**"],
                                limit: effectiveLimit,
                            });
                            signal?.removeEventListener("abort", onAbort);
                            if (results.length === 0) {
                                resolve({
                                    content: [{ type: "text", text: "No files found matching pattern" }],
                                    details: undefined,
                                });
                                return;
                            }
                            // Relativize paths
                            const relativized = results.map((p) => {
                                if (p.startsWith(searchPath)) {
                                    return p.slice(searchPath.length + 1);
                                }
                                return path.relative(searchPath, p);
                            });
                            const resultLimitReached = relativized.length >= effectiveLimit;
                            const rawOutput = relativized.join("\n");
                            const truncation = truncateHead(rawOutput, { maxLines: Number.MAX_SAFE_INTEGER });
                            let resultOutput = truncation.content;
                            const details = {};
                            const notices = [];
                            if (resultLimitReached) {
                                notices.push(`${effectiveLimit} results limit reached`);
                                details.resultLimitReached = effectiveLimit;
                            }
                            if (truncation.truncated) {
                                notices.push(`${formatSize(DEFAULT_MAX_BYTES)} limit reached`);
                                details.truncation = truncation;
                            }
                            if (notices.length > 0) {
                                resultOutput += `\n\n[${notices.join(". ")}]`;
                            }
                            resolve({
                                content: [{ type: "text", text: resultOutput }],
                                details: Object.keys(details).length > 0 ? details : undefined,
                            });
                            return;
                        }
                        // Default: use native Rust glob
                        const globResult = await nativeGlob({
                            pattern,
                            path: searchPath,
                            hidden: true,
                            gitignore: true,
                            cache: true,
                            maxResults: effectiveLimit,
                        });
                        signal?.removeEventListener("abort", onAbort);
                        if (globResult.matches.length === 0) {
                            resolve({
                                content: [{ type: "text", text: "No files found matching pattern" }],
                                details: undefined,
                            });
                            return;
                        }
                        // Native glob returns paths relative to the search root
                        const relativized = globResult.matches.map((m) => m.path);
                        const resultLimitReached = relativized.length >= effectiveLimit;
                        const rawOutput = relativized.join("\n");
                        const truncation = truncateHead(rawOutput, { maxLines: Number.MAX_SAFE_INTEGER });
                        let resultOutput = truncation.content;
                        const details = {};
                        const notices = [];
                        if (resultLimitReached) {
                            notices.push(`${effectiveLimit} results limit reached. Use limit=${effectiveLimit * 2} for more, or refine pattern`);
                            details.resultLimitReached = effectiveLimit;
                        }
                        if (truncation.truncated) {
                            notices.push(`${formatSize(DEFAULT_MAX_BYTES)} limit reached`);
                            details.truncation = truncation;
                        }
                        if (notices.length > 0) {
                            resultOutput += `\n\n[${notices.join(". ")}]`;
                        }
                        resolve({
                            content: [{ type: "text", text: resultOutput }],
                            details: Object.keys(details).length > 0 ? details : undefined,
                        });
                    }
                    catch (e) {
                        signal?.removeEventListener("abort", onAbort);
                        reject(e);
                    }
                })();
            });
        },
    };
}
/** Default find tool using process.cwd() - for backwards compatibility */
export const findTool = createFindTool(process.cwd());
//# sourceMappingURL=find.js.map