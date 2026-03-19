import { getEditorKeybindings } from "../keybindings.js";
import { Loader } from "./loader.js";
/**
 * Loader that can be cancelled with Escape.
 * Extends Loader with an AbortSignal for cancelling async operations.
 *
 * @example
 * const loader = new CancellableLoader(tui, cyan, dim, "Working...");
 * loader.onAbort = () => done(null);
 * doWork(loader.signal).then(done);
 */
export class CancellableLoader extends Loader {
    constructor() {
        super(...arguments);
        this.abortController = new AbortController();
    }
    /** AbortSignal that is aborted when user presses Escape */
    get signal() {
        return this.abortController.signal;
    }
    /** Whether the loader was aborted */
    get aborted() {
        return this.abortController.signal.aborted;
    }
    handleInput(data) {
        const kb = getEditorKeybindings();
        if (kb.matches(data, "selectCancel")) {
            this.abortController.abort();
            this.onAbort?.();
        }
    }
    dispose() {
        this.abortController.abort();
        this.onAbort = undefined;
        this.stop();
    }
}
//# sourceMappingURL=cancellable-loader.js.map