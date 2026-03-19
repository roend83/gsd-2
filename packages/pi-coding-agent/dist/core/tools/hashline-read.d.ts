/**
 * Hashline read tool — reads files with LINE#ID prefix on each line.
 *
 * Produces output like:
 *   1#QQ:function hello() {
 *   2#KX:  return 42;
 *   3#NW:}
 *
 * These tags are used by the hashline_edit tool to address lines precisely.
 */
import type { AgentTool } from "@gsd/pi-agent-core";
import { type Static } from "@sinclair/typebox";
import { type TruncationResult } from "./truncate.js";
declare const readSchema: import("@sinclair/typebox").TObject<{
    path: import("@sinclair/typebox").TString;
    offset: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type HashlineReadToolInput = Static<typeof readSchema>;
export interface HashlineReadToolDetails {
    truncation?: TruncationResult;
}
/**
 * Pluggable operations for the hashline read tool.
 */
export interface HashlineReadOperations {
    readFile: (absolutePath: string) => Promise<Buffer>;
    access: (absolutePath: string) => Promise<void>;
    detectImageMimeType?: (absolutePath: string) => Promise<string | null | undefined>;
}
export interface HashlineReadToolOptions {
    autoResizeImages?: boolean;
    operations?: HashlineReadOperations;
}
export declare function createHashlineReadTool(cwd: string, options?: HashlineReadToolOptions): AgentTool<typeof readSchema>;
/** Default hashline read tool using process.cwd() */
export declare const hashlineReadTool: AgentTool<import("@sinclair/typebox").TObject<{
    path: import("@sinclair/typebox").TString;
    offset: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>, any>;
export {};
//# sourceMappingURL=hashline-read.d.ts.map