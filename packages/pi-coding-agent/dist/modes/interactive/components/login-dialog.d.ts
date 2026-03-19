import { Container, type Focusable, type TUI } from "@gsd/pi-tui";
/**
 * Login dialog component - replaces editor during OAuth login flow.
 *
 * Guards against stuck UI by:
 * - Rejecting any outstanding promise before creating a new one
 * - Listening on the internal AbortSignal so external cancellation cleans up
 * - Exposing a public dispose() method so the caller can force-cleanup
 */
export declare class LoginDialogComponent extends Container implements Focusable {
    private onComplete;
    private contentContainer;
    private input;
    private tui;
    private abortController;
    private inputResolver?;
    private inputRejecter?;
    private disposed;
    private _focused;
    get focused(): boolean;
    set focused(value: boolean);
    constructor(tui: TUI, providerId: string, onComplete: (success: boolean, message?: string) => void);
    get signal(): AbortSignal;
    /**
     * Reject any outstanding input promise without triggering a full cancel.
     * Safe to call multiple times.
     */
    private rejectPending;
    private cancel;
    /**
     * Force-dispose the dialog, rejecting any pending promises.
     * Called by the parent when restoring the editor, as a safety net
     * to ensure no promises are left dangling.
     */
    dispose(): void;
    /**
     * Called by onAuth callback - show URL and optional instructions
     */
    showAuth(url: string, instructions?: string): void;
    /**
     * Show input for manual code/URL entry (for callback server providers)
     */
    showManualInput(prompt: string): Promise<string>;
    /**
     * Called by onPrompt callback - show prompt and wait for input
     * Note: Does NOT clear content, appends to existing (preserves URL from showAuth)
     */
    showPrompt(message: string, placeholder?: string): Promise<string>;
    /**
     * Show waiting message (for polling flows like GitHub Copilot)
     */
    showWaiting(message: string): void;
    /**
     * Called by onProgress callback
     */
    showProgress(message: string): void;
    handleInput(data: string): void;
}
//# sourceMappingURL=login-dialog.d.ts.map