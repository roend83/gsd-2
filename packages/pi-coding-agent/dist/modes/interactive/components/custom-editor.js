import { Editor, isKittyProtocolActive } from "@gsd/pi-tui";
/**
 * Custom editor that handles app-level keybindings for coding-agent.
 */
export class CustomEditor extends Editor {
    constructor(tui, theme, keybindings, options) {
        super(tui, theme, options);
        this.actionHandlers = new Map();
        this.keybindings = keybindings;
    }
    /**
     * Register a handler for an app action.
     */
    onAction(action, handler) {
        this.actionHandlers.set(action, handler);
    }
    handleInput(data) {
        // Check extension-registered shortcuts first
        if (this.onExtensionShortcut?.(data)) {
            return;
        }
        // Check for paste image keybinding
        if (this.keybindings.matches(data, "pasteImage")) {
            this.onPasteImage?.();
            return;
        }
        // Check app keybindings first
        // Escape/interrupt - only if autocomplete is NOT active
        if (this.keybindings.matches(data, "interrupt")) {
            if (!this.isShowingAutocomplete()) {
                // Use dynamic onEscape if set, otherwise registered handler
                const handler = this.onEscape ?? this.actionHandlers.get("interrupt");
                if (handler) {
                    handler();
                    return;
                }
            }
            // Let parent handle escape for autocomplete cancellation
            super.handleInput(data);
            return;
        }
        // Exit (Ctrl+D) - only when editor is empty
        if (this.keybindings.matches(data, "exit")) {
            if (this.getText().length === 0) {
                const handler = this.onCtrlD ?? this.actionHandlers.get("exit");
                if (handler)
                    handler();
                return;
            }
            // Fall through to editor handling for delete-char-forward when not empty
        }
        // Check all other app actions
        for (const [action, handler] of this.actionHandlers) {
            if (action !== "interrupt" && action !== "exit" && this.keybindings.matches(data, action)) {
                // When kitty protocol is not active, \x1b\r is ambiguous:
                // it could be alt+enter (followUp) or shift+enter mapped via /terminal-setup.
                // Prioritize newLine since that's what terminal-setup configures.
                // Alt+enter followUp still works in kitty-protocol terminals.
                if (action === "followUp" && !isKittyProtocolActive() && data === "\x1b\r") {
                    break; // Fall through to parent editor's newLine handling
                }
                handler();
                return;
            }
        }
        // Pass to parent for editor handling
        super.handleInput(data);
    }
}
//# sourceMappingURL=custom-editor.js.map