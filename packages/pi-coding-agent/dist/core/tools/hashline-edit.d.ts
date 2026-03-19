/**
 * Hashline edit tool — applies file edits using line-hash anchors.
 *
 * The model references lines by `LINE#ID` tags from read output.
 * Each tag uniquely identifies a line, so edits remain stable even when lines shift.
 */
import type { AgentTool } from "@gsd/pi-agent-core";
import { type Static } from "@sinclair/typebox";
declare const hashlineEditItemSchema: import("@sinclair/typebox").TObject<{
    op: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"replace">, import("@sinclair/typebox").TLiteral<"append">, import("@sinclair/typebox").TLiteral<"prepend">]>;
    pos: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    end: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    lines: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>, import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
}>;
declare const hashlineEditSchema: import("@sinclair/typebox").TObject<{
    path: import("@sinclair/typebox").TString;
    edits: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        op: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"replace">, import("@sinclair/typebox").TLiteral<"append">, import("@sinclair/typebox").TLiteral<"prepend">]>;
        pos: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        end: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        lines: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>, import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    }>>;
    delete: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    move: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type HashlineEditInput = Static<typeof hashlineEditSchema>;
export type HashlineEditItem = Static<typeof hashlineEditItemSchema>;
export interface HashlineEditToolDetails {
    /** Unified diff of the changes made */
    diff: string;
    /** Line number of the first change in the new file */
    firstChangedLine?: number;
}
/**
 * Pluggable operations for the hashline edit tool.
 */
export interface HashlineEditOperations {
    readFile: (absolutePath: string) => Promise<Buffer>;
    writeFile: (absolutePath: string, content: string) => Promise<void>;
    access: (absolutePath: string) => Promise<void>;
    unlink: (absolutePath: string) => Promise<void>;
}
export interface HashlineEditToolOptions {
    operations?: HashlineEditOperations;
}
export declare function createHashlineEditTool(cwd: string, options?: HashlineEditToolOptions): AgentTool<typeof hashlineEditSchema>;
/** Default hashline edit tool using process.cwd() */
export declare const hashlineEditTool: AgentTool<import("@sinclair/typebox").TObject<{
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
export {};
//# sourceMappingURL=hashline-edit.d.ts.map