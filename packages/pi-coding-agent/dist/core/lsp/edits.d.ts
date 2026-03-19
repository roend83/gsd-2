import type { TextEdit, WorkspaceEdit } from "./types.js";
/**
 * Apply text edits to a string in-memory.
 * Edits are applied in reverse order (bottom-to-top) to preserve line/character indices.
 */
export declare function applyTextEditsToString(content: string, edits: TextEdit[]): string;
/**
 * Apply text edits to a file.
 * Edits are applied in reverse order (bottom-to-top) to preserve line/character indices.
 */
export declare function applyTextEdits(filePath: string, edits: TextEdit[]): Promise<void>;
/**
 * Apply a workspace edit (collection of file changes).
 * Returns array of applied change descriptions.
 */
export declare function applyWorkspaceEdit(edit: WorkspaceEdit, cwd: string): Promise<string[]>;
//# sourceMappingURL=edits.d.ts.map