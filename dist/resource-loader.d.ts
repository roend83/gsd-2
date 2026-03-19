import { DefaultResourceLoader } from '@gsd/pi-coding-agent';
export { discoverExtensionEntryPaths } from './extension-discovery.js';
export declare function getExtensionKey(entryPath: string, extensionsDir: string): string;
export declare function readManagedResourceVersion(agentDir: string): string | null;
export declare function getNewerManagedResourceVersion(agentDir: string, currentVersion: string): string | null;
/**
 * Syncs all bundled resources to agentDir (~/.gsd/agent/) on every launch.
 *
 * - extensions/ → ~/.gsd/agent/extensions/   (overwrite when version changes)
 * - agents/     → ~/.gsd/agent/agents/        (overwrite when version changes)
 * - skills/     → ~/.gsd/agent/skills/        (overwrite when version changes)
 * - GSD-WORKFLOW.md is read directly from bundled path via GSD_WORKFLOW_PATH env var
 *
 * Skips the copy when the managed-resources.json version matches the current
 * GSD version, avoiding ~128ms of synchronous cpSync on every startup.
 * After `npm update -g @glittercowboy/gsd`, versions will differ and the
 * copy runs once to land the new resources.
 *
 * Inspectable: `ls ~/.gsd/agent/extensions/`
 */
export declare function initResources(agentDir: string): void;
export declare function hasStaleCompiledExtensionSiblings(extensionsDir: string): boolean;
export declare function buildResourceLoader(agentDir: string): DefaultResourceLoader;
