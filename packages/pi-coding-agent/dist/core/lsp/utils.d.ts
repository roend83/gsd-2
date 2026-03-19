import type { CallHierarchyItem, CodeAction, Command, Diagnostic, DiagnosticSeverity, DocumentSymbol, Location, SignatureHelp, SymbolInformation, SymbolKind, TextEdit, WorkspaceEdit } from "./types.js";
/**
 * Detect language ID from file path.
 */
export declare function detectLanguageId(filePath: string): string;
export declare function fileToUri(filePath: string): string;
export declare function uriToFile(uri: string): string;
export declare function severityToString(severity?: DiagnosticSeverity): string;
export declare function sortDiagnostics(diagnostics: Diagnostic[]): Diagnostic[];
export declare function severityToIcon(severity?: DiagnosticSeverity): string;
export declare function formatDiagnostic(diagnostic: Diagnostic, filePath: string): string;
export declare function formatGroupedDiagnosticMessages(messages: string[]): string;
export declare function formatDiagnosticsSummary(diagnostics: Diagnostic[]): string;
export declare function formatLocation(location: Location, cwd: string): string;
export declare function formatPosition(line: number, col: number): string;
export declare function formatWorkspaceEdit(edit: WorkspaceEdit, cwd: string): string[];
export declare function formatTextEdit(edit: TextEdit, maxLength?: number): string;
export declare function symbolKindToIcon(kind: SymbolKind): string;
export declare function symbolKindToName(kind: SymbolKind): string;
export declare function formatDocumentSymbol(symbol: DocumentSymbol, indent?: number): string[];
export declare function formatSymbolInformation(symbol: SymbolInformation, cwd: string): string;
export declare function filterWorkspaceSymbols(symbols: SymbolInformation[], query: string): SymbolInformation[];
export declare function dedupeWorkspaceSymbols(symbols: SymbolInformation[]): SymbolInformation[];
export declare function formatCodeAction(action: CodeAction | Command, index: number): string;
export interface CodeActionApplyDependencies {
    resolveCodeAction?: (action: CodeAction) => Promise<CodeAction>;
    applyWorkspaceEdit: (edit: WorkspaceEdit) => Promise<string[]>;
    executeCommand: (command: Command) => Promise<void>;
}
export interface AppliedCodeActionResult {
    title: string;
    edits: string[];
    executedCommands: string[];
}
export declare function applyCodeAction(action: CodeAction | Command, dependencies: CodeActionApplyDependencies): Promise<AppliedCodeActionResult | null>;
export declare function hasGlobPattern(value: string): boolean;
export declare function collectGlobMatches(pattern: string, cwd: string, maxMatches: number): Promise<{
    matches: string[];
    truncated: boolean;
}>;
export declare function extractHoverText(contents: string | {
    kind: string;
    value: string;
} | {
    language: string;
    value: string;
} | unknown[]): string;
export declare function resolveSymbolColumn(filePath: string, line: number, symbol?: string, occurrence?: number): Promise<number>;
export declare function readLocationContext(filePath: string, line: number, contextLines?: number): Promise<string[]>;
export declare function formatCallHierarchyItem(item: CallHierarchyItem, cwd: string): string;
export declare function formatSignatureHelp(result: SignatureHelp): string;
//# sourceMappingURL=utils.d.ts.map