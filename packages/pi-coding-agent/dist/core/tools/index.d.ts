export { type BashOperations, type BashSpawnContext, type BashSpawnHook, type BashToolDetails, type BashToolInput, type BashToolOptions, bashTool, createBashTool, rewriteBackgroundCommand, } from "./bash.js";
export { type BashInterceptorRule, checkBashInterception, type CompiledInterceptor, compileInterceptor, DEFAULT_BASH_INTERCEPTOR_RULES, type InterceptionResult, } from "./bash-interceptor.js";
export { createEditTool, type EditOperations, type EditToolDetails, type EditToolInput, type EditToolOptions, editTool, } from "./edit.js";
export { createFindTool, type FindOperations, type FindToolDetails, type FindToolInput, type FindToolOptions, findTool, } from "./find.js";
export { createGrepTool, type GrepOperations, type GrepToolDetails, type GrepToolInput, type GrepToolOptions, grepTool, } from "./grep.js";
export { createLsTool, type LsOperations, type LsToolDetails, type LsToolInput, type LsToolOptions, lsTool, } from "./ls.js";
export { createReadTool, type ReadOperations, type ReadToolDetails, type ReadToolInput, type ReadToolOptions, readTool, } from "./read.js";
export { DEFAULT_MAX_BYTES, DEFAULT_MAX_LINES, formatSize, type TruncationOptions, type TruncationResult, truncateHead, truncateLine, truncateTail, } from "./truncate.js";
export { createWriteTool, type WriteOperations, type WriteToolInput, type WriteToolOptions, writeTool, } from "./write.js";
export { createHashlineEditTool, type HashlineEditInput, type HashlineEditItem, type HashlineEditOperations, type HashlineEditToolDetails, type HashlineEditToolOptions, hashlineEditTool, } from "./hashline-edit.js";
export { createHashlineReadTool, type HashlineReadOperations, type HashlineReadToolDetails, type HashlineReadToolInput, type HashlineReadToolOptions, hashlineReadTool, } from "./hashline-read.js";
export { type Anchor, applyHashlineEdits, computeLineHash, formatHashLines, formatLineTag, type HashlineEdit, HashlineMismatchError, parseHashlineText, type HashMismatch, parseTag, stripNewLinePrefixes, validateLineRef, } from "./hashline.js";
export { createLspTool, type LspToolDetails, lspSchema, lspTool, } from "../lsp/index.js";
export type { LspServerStatus } from "../lsp/client.js";
import type { AgentTool } from "@gsd/pi-agent-core";
import { type BashToolOptions } from "./bash.js";
import { type ReadToolOptions } from "./read.js";
/** Tool type (AgentTool from pi-ai) */
export type Tool = AgentTool<any>;
export declare const codingTools: Tool[];
export declare const readOnlyTools: Tool[];
export declare const allTools: {
    read: AgentTool<import("@sinclair/typebox").TObject<{
        path: import("@sinclair/typebox").TString;
        offset: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>, any>;
    bash: AgentTool<import("@sinclair/typebox").TObject<{
        command: import("@sinclair/typebox").TString;
        timeout: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>, any>;
    edit: AgentTool<import("@sinclair/typebox").TObject<{
        path: import("@sinclair/typebox").TString;
        oldText: import("@sinclair/typebox").TString;
        newText: import("@sinclair/typebox").TString;
    }>, any>;
    write: AgentTool<import("@sinclair/typebox").TObject<{
        path: import("@sinclair/typebox").TString;
        content: import("@sinclair/typebox").TString;
    }>, any>;
    grep: AgentTool<import("@sinclair/typebox").TObject<{
        pattern: import("@sinclair/typebox").TString;
        path: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        glob: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        ignoreCase: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        literal: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        context: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>, any>;
    find: AgentTool<import("@sinclair/typebox").TObject<{
        pattern: import("@sinclair/typebox").TString;
        path: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>, any>;
    ls: AgentTool<import("@sinclair/typebox").TObject<{
        path: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>, any>;
    lsp: AgentTool<import("@sinclair/typebox").TObject<{
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
    }>, import("../lsp/types.js").LspToolDetails>;
    hashline_edit: AgentTool<import("@sinclair/typebox").TObject<{
        path: import("@sinclair/typebox").TString;
        edits: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            op: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"replace">, import("@sinclair/typebox").TLiteral<"append">, import("@sinclair/typebox").TLiteral<"prepend">]>;
            pos: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            end: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            lines: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>, import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        }>>;
        delete: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
        move: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>, any>;
    hashline_read: AgentTool<import("@sinclair/typebox").TObject<{
        path: import("@sinclair/typebox").TString;
        offset: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    }>, any>;
};
export declare const hashlineCodingTools: Tool[];
export type ToolName = keyof typeof allTools;
export interface ToolsOptions {
    /** Options for the read tool */
    read?: ReadToolOptions;
    /** Options for the bash tool */
    bash?: BashToolOptions;
}
/**
 * Create coding tools configured for a specific working directory.
 */
export declare function createCodingTools(cwd: string, options?: ToolsOptions): Tool[];
/**
 * Create read-only tools configured for a specific working directory.
 */
export declare function createReadOnlyTools(cwd: string, options?: ToolsOptions): Tool[];
/**
 * Create all tools configured for a specific working directory.
 */
export declare function createAllTools(cwd: string, options?: ToolsOptions): Record<ToolName, Tool>;
/**
 * Create hashline-mode coding tools configured for a specific working directory.
 * Uses hashline read (LINE#ID prefixed output) and hashline edit (hash-anchor based edits).
 */
export declare function createHashlineCodingTools(cwd: string, options?: ToolsOptions): Tool[];
//# sourceMappingURL=index.d.ts.map