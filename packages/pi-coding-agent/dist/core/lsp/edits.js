import * as fs from "node:fs/promises";
import path from "node:path";
import { uriToFile } from "./utils.js";
// =============================================================================
// Text Edit Application
// =============================================================================
/**
 * Apply text edits to a string in-memory.
 * Edits are applied in reverse order (bottom-to-top) to preserve line/character indices.
 */
export function applyTextEditsToString(content, edits) {
    const lines = content.split("\n");
    // Sort edits in reverse order (bottom-to-top, right-to-left)
    const sortedEdits = [...edits].sort((a, b) => {
        if (a.range.start.line !== b.range.start.line) {
            return b.range.start.line - a.range.start.line;
        }
        return b.range.start.character - a.range.start.character;
    });
    for (const edit of sortedEdits) {
        const { start, end } = edit.range;
        // Single-line edit: replace substring within same line
        if (start.line === end.line) {
            const line = lines[start.line] || "";
            lines[start.line] = line.slice(0, start.character) + edit.newText + line.slice(end.character);
        }
        else {
            // Multi-line edit: splice across multiple lines
            const startLine = lines[start.line] || "";
            const endLine = lines[end.line] || "";
            const newContent = startLine.slice(0, start.character) + edit.newText + endLine.slice(end.character);
            lines.splice(start.line, end.line - start.line + 1, ...newContent.split("\n"));
        }
    }
    return lines.join("\n");
}
/**
 * Apply text edits to a file.
 * Edits are applied in reverse order (bottom-to-top) to preserve line/character indices.
 */
export async function applyTextEdits(filePath, edits) {
    const content = await fs.readFile(filePath, "utf-8");
    const result = applyTextEditsToString(content, edits);
    await fs.writeFile(filePath, result);
}
// =============================================================================
// Workspace Edit Application
// =============================================================================
/**
 * Apply a workspace edit (collection of file changes).
 * Returns array of applied change descriptions.
 */
export async function applyWorkspaceEdit(edit, cwd) {
    const applied = [];
    // Handle changes map (legacy format)
    if (edit.changes) {
        for (const [uri, textEdits] of Object.entries(edit.changes)) {
            const filePath = uriToFile(uri);
            await applyTextEdits(filePath, textEdits);
            applied.push(`Applied ${textEdits.length} edit(s) to ${path.relative(cwd, filePath)}`);
        }
    }
    // Handle documentChanges array (modern format)
    if (edit.documentChanges) {
        for (const change of edit.documentChanges) {
            if ("textDocument" in change && change.textDocument && "edits" in change && change.edits) {
                // TextDocumentEdit
                const docChange = change;
                const filePath = uriToFile(docChange.textDocument.uri);
                const textEdits = docChange.edits.filter((e) => "range" in e && "newText" in e);
                await applyTextEdits(filePath, textEdits);
                applied.push(`Applied ${textEdits.length} edit(s) to ${path.relative(cwd, filePath)}`);
            }
            else if ("kind" in change && change.kind) {
                // Resource operations
                if (change.kind === "create") {
                    const createOp = change;
                    const filePath = uriToFile(createOp.uri);
                    await fs.writeFile(filePath, "");
                    applied.push(`Created ${path.relative(cwd, filePath)}`);
                }
                else if (change.kind === "rename") {
                    const renameOp = change;
                    const oldPath = uriToFile(renameOp.oldUri);
                    const newPath = uriToFile(renameOp.newUri);
                    await fs.mkdir(path.dirname(newPath), { recursive: true });
                    await fs.rename(oldPath, newPath);
                    applied.push(`Renamed ${path.relative(cwd, oldPath)} → ${path.relative(cwd, newPath)}`);
                }
                else if (change.kind === "delete") {
                    const deleteOp = change;
                    const filePath = uriToFile(deleteOp.uri);
                    await fs.rm(filePath, { recursive: true });
                    applied.push(`Deleted ${path.relative(cwd, filePath)}`);
                }
            }
        }
    }
    return applied;
}
//# sourceMappingURL=edits.js.map