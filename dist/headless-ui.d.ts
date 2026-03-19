/**
 * Headless UI Handling — auto-response, progress formatting, and supervised stdin
 *
 * Handles extension UI requests (auto-responding in headless mode),
 * formats progress events for stderr output, and reads orchestrator
 * commands from stdin in supervised mode.
 */
import { RpcClient } from '@gsd/pi-coding-agent';
interface ExtensionUIRequest {
    type: 'extension_ui_request';
    id: string;
    method: string;
    title?: string;
    options?: string[];
    message?: string;
    prefill?: string;
    timeout?: number;
    [key: string]: unknown;
}
export type { ExtensionUIRequest };
export declare function handleExtensionUIRequest(event: ExtensionUIRequest, writeToStdin: (data: string) => void): void;
export declare function formatProgress(event: Record<string, unknown>, verbose: boolean): string | null;
export declare function startSupervisedStdinReader(stdinWriter: (data: string) => void, client: RpcClient, onResponse: (id: string) => void): () => void;
