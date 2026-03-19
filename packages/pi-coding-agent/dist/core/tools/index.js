export { bashTool, createBashTool, rewriteBackgroundCommand, } from "./bash.js";
export { checkBashInterception, compileInterceptor, DEFAULT_BASH_INTERCEPTOR_RULES, } from "./bash-interceptor.js";
export { createEditTool, editTool, } from "./edit.js";
export { createFindTool, findTool, } from "./find.js";
export { createGrepTool, grepTool, } from "./grep.js";
export { createLsTool, lsTool, } from "./ls.js";
export { createReadTool, readTool, } from "./read.js";
export { DEFAULT_MAX_BYTES, DEFAULT_MAX_LINES, formatSize, truncateHead, truncateLine, truncateTail, } from "./truncate.js";
export { createWriteTool, writeTool, } from "./write.js";
export { createHashlineEditTool, hashlineEditTool, } from "./hashline-edit.js";
export { createHashlineReadTool, hashlineReadTool, } from "./hashline-read.js";
export { applyHashlineEdits, computeLineHash, formatHashLines, formatLineTag, HashlineMismatchError, parseHashlineText, parseTag, stripNewLinePrefixes, validateLineRef, } from "./hashline.js";
export { createLspTool, lspSchema, lspTool, } from "../lsp/index.js";
import { bashTool, createBashTool } from "./bash.js";
import { createEditTool, editTool } from "./edit.js";
import { createFindTool, findTool } from "./find.js";
import { createGrepTool, grepTool } from "./grep.js";
import { createHashlineEditTool, hashlineEditTool } from "./hashline-edit.js";
import { createHashlineReadTool, hashlineReadTool } from "./hashline-read.js";
import { createLsTool, lsTool } from "./ls.js";
import { createReadTool, readTool } from "./read.js";
import { createWriteTool, writeTool } from "./write.js";
import { createLspTool, lspTool } from "../lsp/index.js";
// Default tools for full access mode (using process.cwd())
export const codingTools = [readTool, bashTool, editTool, writeTool];
// Read-only tools for exploration without modification (using process.cwd())
export const readOnlyTools = [readTool, grepTool, findTool, lsTool];
// All available tools (using process.cwd())
export const allTools = {
    read: readTool,
    bash: bashTool,
    edit: editTool,
    write: writeTool,
    grep: grepTool,
    find: findTool,
    ls: lsTool,
    lsp: lspTool,
    hashline_edit: hashlineEditTool,
    hashline_read: hashlineReadTool,
};
// Hashline-mode coding tools — read with hash anchors, edit with hash references
export const hashlineCodingTools = [hashlineReadTool, bashTool, hashlineEditTool, writeTool];
/**
 * Create coding tools configured for a specific working directory.
 */
export function createCodingTools(cwd, options) {
    return [
        createReadTool(cwd, options?.read),
        createBashTool(cwd, options?.bash),
        createEditTool(cwd),
        createWriteTool(cwd),
    ];
}
/**
 * Create read-only tools configured for a specific working directory.
 */
export function createReadOnlyTools(cwd, options) {
    return [createReadTool(cwd, options?.read), createGrepTool(cwd), createFindTool(cwd), createLsTool(cwd)];
}
/**
 * Create all tools configured for a specific working directory.
 */
export function createAllTools(cwd, options) {
    return {
        read: createReadTool(cwd, options?.read),
        bash: createBashTool(cwd, options?.bash),
        edit: createEditTool(cwd),
        write: createWriteTool(cwd),
        grep: createGrepTool(cwd),
        find: createFindTool(cwd),
        ls: createLsTool(cwd),
        lsp: createLspTool(cwd),
        hashline_edit: createHashlineEditTool(cwd),
        hashline_read: createHashlineReadTool(cwd, options?.read),
    };
}
/**
 * Create hashline-mode coding tools configured for a specific working directory.
 * Uses hashline read (LINE#ID prefixed output) and hashline edit (hash-anchor based edits).
 */
export function createHashlineCodingTools(cwd, options) {
    return [
        createHashlineReadTool(cwd, options?.read),
        createBashTool(cwd, options?.bash),
        createHashlineEditTool(cwd),
        createWriteTool(cwd),
    ];
}
//# sourceMappingURL=index.js.map