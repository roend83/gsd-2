import type { AgentTool } from "@gsd/pi-agent-core";
import { type LspServerStatus } from "./client.js";
import { type LspToolDetails, lspSchema } from "./types.js";
export type { LspServerStatus } from "./client.js";
export type { LspToolDetails } from "./types.js";
export { lspSchema } from "./types.js";
export interface LspWarmupResult {
    servers: Array<{
        name: string;
        status: "ready" | "error";
        fileTypes: string[];
        error?: string;
    }>;
}
export declare function warmupLspServers(cwd: string): Promise<LspWarmupResult>;
export declare function getLspStatus(): LspServerStatus[];
/**
 * Create an LSP tool configured for a specific working directory.
 */
export declare function createLspTool(cwd: string): AgentTool<typeof lspSchema, LspToolDetails>;
/**
 * Default LSP tool using process.cwd().
 */
export declare const lspTool: AgentTool<import("@sinclair/typebox").TObject<{
    action: import("@sinclair/typebox").TUnsafe<string>;
    file: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    line: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    symbol: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    occurrence: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    query: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    new_name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    apply: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    tab_size: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    insert_spaces: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    timeout: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>, LspToolDetails>;
//# sourceMappingURL=index.d.ts.map