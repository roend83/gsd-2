/**
 * Local helpers replacing @oh-my-pi/pi-utils and tool-errors/tool-timeouts imports.
 */
export declare class ToolAbortError extends Error {
    constructor();
}
export declare function throwIfAborted(signal?: AbortSignal): void;
export declare function isEnoent(err: unknown): boolean;
export declare function isRecord(v: unknown): v is Record<string, unknown>;
export declare function clampTimeout(timeout?: number): number;
/**
 * Run a promise, rejecting if the signal aborts.
 */
export declare function untilAborted<T>(signal: AbortSignal | undefined, fn: () => Promise<T>): Promise<T>;
//# sourceMappingURL=helpers.d.ts.map