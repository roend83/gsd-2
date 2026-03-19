import { type Static, type TUnsafe } from "@sinclair/typebox";
import type { ChildProcess } from "node:child_process";
export declare const lspSchema: import("@sinclair/typebox").TObject<{
    action: TUnsafe<string>;
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
}>;
export type LspParams = Static<typeof lspSchema>;
export interface LspToolDetails {
    serverName?: string;
    action: string;
    success: boolean;
    request?: LspParams;
}
export interface Position {
    line: number;
    character: number;
}
export interface Range {
    start: Position;
    end: Position;
}
export interface Location {
    uri: string;
    range: Range;
}
export interface LocationLink {
    originSelectionRange?: Range;
    targetUri: string;
    targetRange: Range;
    targetSelectionRange: Range;
}
export type DiagnosticSeverity = 1 | 2 | 3 | 4;
export interface DiagnosticRelatedInformation {
    location: Location;
    message: string;
}
export interface Diagnostic {
    range: Range;
    severity?: DiagnosticSeverity;
    code?: string | number;
    codeDescription?: {
        href: string;
    };
    source?: string;
    message: string;
    tags?: number[];
    relatedInformation?: DiagnosticRelatedInformation[];
    data?: unknown;
}
export interface TextEdit {
    range: Range;
    newText: string;
}
export interface AnnotatedTextEdit extends TextEdit {
    annotationId?: string;
}
export interface TextDocumentIdentifier {
    uri: string;
}
export interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
    version: number | null;
}
export interface OptionalVersionedTextDocumentIdentifier extends TextDocumentIdentifier {
    version?: number | null;
}
export interface TextDocumentEdit {
    textDocument: OptionalVersionedTextDocumentIdentifier;
    edits: (TextEdit | AnnotatedTextEdit)[];
}
export interface CreateFileOptions {
    overwrite?: boolean;
    ignoreIfExists?: boolean;
}
export interface CreateFile {
    kind: "create";
    uri: string;
    options?: CreateFileOptions;
}
export interface RenameFileOptions {
    overwrite?: boolean;
    ignoreIfExists?: boolean;
}
export interface RenameFile {
    kind: "rename";
    oldUri: string;
    newUri: string;
    options?: RenameFileOptions;
}
export interface DeleteFileOptions {
    recursive?: boolean;
    ignoreIfNotExists?: boolean;
}
export interface DeleteFile {
    kind: "delete";
    uri: string;
    options?: DeleteFileOptions;
}
export type DocumentChange = TextDocumentEdit | CreateFile | RenameFile | DeleteFile;
export interface WorkspaceEdit {
    changes?: Record<string, TextEdit[]>;
    documentChanges?: DocumentChange[];
    changeAnnotations?: Record<string, {
        label: string;
        needsConfirmation?: boolean;
        description?: string;
    }>;
}
export type CodeActionKind = "quickfix" | "refactor" | "refactor.extract" | "refactor.inline" | "refactor.rewrite" | "source" | "source.organizeImports" | "source.fixAll" | string;
export interface Command {
    title: string;
    command: string;
    arguments?: unknown[];
}
export interface CodeAction {
    title: string;
    kind?: CodeActionKind;
    diagnostics?: Diagnostic[];
    isPreferred?: boolean;
    disabled?: {
        reason: string;
    };
    edit?: WorkspaceEdit;
    command?: Command;
    data?: unknown;
}
export interface CodeActionContext {
    diagnostics: Diagnostic[];
    only?: CodeActionKind[];
    triggerKind?: 1 | 2;
}
export type SymbolKind = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26;
export declare const SYMBOL_KIND_NAMES: Record<SymbolKind, string>;
export interface DocumentSymbol {
    name: string;
    detail?: string;
    kind: SymbolKind;
    tags?: number[];
    deprecated?: boolean;
    range: Range;
    selectionRange: Range;
    children?: DocumentSymbol[];
}
export interface SymbolInformation {
    name: string;
    kind: SymbolKind;
    tags?: number[];
    deprecated?: boolean;
    location: Location;
    containerName?: string;
}
export interface MarkupContent {
    kind: "plaintext" | "markdown";
    value: string;
}
export type MarkedString = string | {
    language: string;
    value: string;
};
export interface Hover {
    contents: MarkupContent | MarkedString | MarkedString[];
    range?: Range;
}
export interface ServerCapabilities {
    flycheck?: boolean;
    ssr?: boolean;
    expandMacro?: boolean;
    runnables?: boolean;
    relatedTests?: boolean;
}
export interface ServerConfig {
    command: string;
    args?: string[];
    fileTypes: string[];
    rootMarkers: string[];
    initOptions?: Record<string, unknown>;
    settings?: Record<string, unknown>;
    disabled?: boolean;
    /** Per-server warmup timeout in milliseconds. */
    warmupTimeoutMs?: number;
    capabilities?: ServerCapabilities;
    /** If true, this is a linter/formatter server — used only for diagnostics/actions, not type intelligence */
    isLinter?: boolean;
    /** Resolved absolute path to the command binary (set during config loading) */
    resolvedCommand?: string;
}
export interface OpenFile {
    version: number;
    languageId: string;
}
export interface PendingRequest {
    resolve: (result: unknown) => void;
    reject: (error: Error) => void;
    method: string;
}
export interface LspServerCapabilities {
    renameProvider?: boolean | {
        prepareProvider?: boolean;
    };
    codeActionProvider?: boolean | {
        resolveProvider?: boolean;
    };
    hoverProvider?: boolean;
    definitionProvider?: boolean;
    referencesProvider?: boolean;
    documentSymbolProvider?: boolean;
    documentFormattingProvider?: boolean;
    workspaceSymbolProvider?: boolean;
    [key: string]: unknown;
}
export interface LspClient {
    name: string;
    cwd: string;
    config: ServerConfig;
    proc: {
        stdin: ChildProcess["stdin"];
        stdout: ChildProcess["stdout"];
        stderr: ChildProcess["stderr"];
        pid: number;
        exitCode: number | null;
        exited: Promise<number>;
        kill(signal?: number): void;
    };
    requestId: number;
    diagnostics: Map<string, Diagnostic[]>;
    diagnosticsVersion: number;
    openFiles: Map<string, OpenFile>;
    pendingRequests: Map<number, PendingRequest>;
    messageBuffer: Buffer;
    isReading: boolean;
    serverCapabilities?: LspServerCapabilities;
    lastActivity: number;
    stderrBuffer: string;
}
export interface LspJsonRpcRequest {
    jsonrpc: "2.0";
    id: number;
    method: string;
    params: unknown;
}
export interface LspJsonRpcResponse {
    jsonrpc: "2.0";
    id?: number;
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}
export interface LspJsonRpcNotification {
    jsonrpc: "2.0";
    method: string;
    params?: unknown;
}
export interface CallHierarchyItem {
    name: string;
    kind: SymbolKind;
    tags?: number[];
    detail?: string;
    uri: string;
    range: Range;
    selectionRange: Range;
    data?: unknown;
}
export interface CallHierarchyIncomingCall {
    from: CallHierarchyItem;
    fromRanges: Range[];
}
export interface CallHierarchyOutgoingCall {
    to: CallHierarchyItem;
    fromRanges: Range[];
}
export interface ParameterInformation {
    label: string | [number, number];
    documentation?: string | MarkupContent;
}
export interface SignatureInformation {
    label: string;
    documentation?: string | MarkupContent;
    parameters?: ParameterInformation[];
    activeParameter?: number;
}
export interface SignatureHelp {
    signatures: SignatureInformation[];
    activeSignature?: number;
    activeParameter?: number;
}
//# sourceMappingURL=types.d.ts.map