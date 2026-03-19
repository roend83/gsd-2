/**
 * Extension system for lifecycle events and custom tools.
 */
export { createExtensionRuntime, discoverAndLoadExtensions, getUntrustedExtensionPaths, importExtensionModule, isProjectTrusted, loadExtensionFromFactory, loadExtensions, trustProject, } from "./loader.js";
export { ExtensionRunner } from "./runner.js";
// Type guards
export { isBashToolResult, isEditToolResult, isFindToolResult, isGrepToolResult, isLsToolResult, isReadToolResult, isToolCallEventType, isWriteToolResult, } from "./types.js";
export { wrapRegisteredTool, wrapRegisteredTools, wrapToolsWithExtensions, wrapToolWithExtensions, } from "./wrapper.js";
//# sourceMappingURL=index.js.map