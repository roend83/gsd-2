/**
 * Local helpers replacing @oh-my-pi/pi-utils and tool-errors/tool-timeouts imports.
 */
export class ToolAbortError extends Error {
    constructor() {
        super("Tool execution aborted");
        this.name = "ToolAbortError";
    }
}
export function throwIfAborted(signal) {
    if (signal?.aborted) {
        throw new ToolAbortError();
    }
}
export function isEnoent(err) {
    return err?.code === "ENOENT";
}
export function isRecord(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}
export function clampTimeout(timeout) {
    return Math.max(5, Math.min(60, timeout ?? 20));
}
/**
 * Run a promise, rejecting if the signal aborts.
 */
export async function untilAborted(signal, fn) {
    if (signal?.aborted) {
        throw new ToolAbortError();
    }
    if (!signal) {
        return fn();
    }
    return new Promise((resolve, reject) => {
        const onAbort = () => reject(new ToolAbortError());
        signal.addEventListener("abort", onAbort, { once: true });
        fn().then(result => {
            signal.removeEventListener("abort", onAbort);
            resolve(result);
        }, err => {
            signal.removeEventListener("abort", onAbort);
            reject(err);
        });
    });
}
//# sourceMappingURL=helpers.js.map