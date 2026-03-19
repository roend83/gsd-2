/**
 * Generic selector component for extensions.
 * Displays a list of string options with keyboard navigation.
 * Options starting with SEPARATOR_PREFIX are rendered as non-selectable group headers.
 */
import { Container, getEditorKeybindings, Spacer, Text } from "@gsd/pi-tui";
import { theme } from "../theme/theme.js";
import { CountdownTimer } from "./countdown-timer.js";
import { DynamicBorder } from "./dynamic-border.js";
import { keyHint, rawKeyHint } from "./keybinding-hints.js";
/** Prefix that marks an option as a non-selectable group header. */
export const SEPARATOR_PREFIX = "───";
export class ExtensionSelectorComponent extends Container {
    constructor(title, options, onSelect, onCancel, opts) {
        super();
        this.selectedIndex = 0;
        this.options = options;
        this.onSelectCallback = onSelect;
        this.onCancelCallback = onCancel;
        this.baseTitle = title;
        this.addChild(new DynamicBorder());
        this.addChild(new Spacer(1));
        this.titleText = new Text(theme.fg("accent", title), 1, 0);
        this.addChild(this.titleText);
        this.addChild(new Spacer(1));
        if (opts?.timeout && opts.timeout > 0 && opts.tui) {
            this.countdown = new CountdownTimer(opts.timeout, opts.tui, (s) => this.titleText.setText(theme.fg("accent", `${this.baseTitle} (${s}s)`)), () => this.onCancelCallback());
        }
        this.listContainer = new Container();
        this.addChild(this.listContainer);
        this.addChild(new Spacer(1));
        this.addChild(new Text(rawKeyHint("↑↓", "navigate") +
            "  " +
            keyHint("selectConfirm", "select") +
            "  " +
            keyHint("selectCancel", "cancel"), 1, 0));
        this.addChild(new Spacer(1));
        this.addChild(new DynamicBorder());
        // Start on the first selectable (non-separator) item
        this.selectedIndex = this.nextSelectable(0, 1);
        this.updateList();
    }
    isSeparator(index) {
        return this.options[index]?.startsWith(SEPARATOR_PREFIX) ?? false;
    }
    /**
     * Find the next selectable index starting from `from` in the given direction.
     * Returns `from` clamped to bounds if nothing selectable is found.
     */
    nextSelectable(from, direction) {
        let idx = from;
        while (idx >= 0 && idx < this.options.length && this.isSeparator(idx)) {
            idx += direction;
        }
        if (idx < 0 || idx >= this.options.length) {
            return Math.max(0, Math.min(from, this.options.length - 1));
        }
        return idx;
    }
    updateList() {
        this.listContainer.clear();
        for (let i = 0; i < this.options.length; i++) {
            const option = this.options[i];
            if (this.isSeparator(i)) {
                this.listContainer.addChild(new Text(theme.fg("borderAccent", `  ${option}`), 1, 0));
                continue;
            }
            const isSelected = i === this.selectedIndex;
            const text = isSelected
                ? theme.fg("accent", "→ ") + theme.fg("accent", option)
                : `  ${theme.fg("text", option)}`;
            this.listContainer.addChild(new Text(text, 1, 0));
        }
    }
    handleInput(keyData) {
        const kb = getEditorKeybindings();
        if (kb.matches(keyData, "selectUp") || keyData === "k") {
            let next = this.selectedIndex - 1;
            if (next < 0)
                next = this.options.length - 1;
            next = this.nextSelectable(next, -1);
            if (this.isSeparator(next)) {
                next = this.nextSelectable(this.options.length - 1, -1);
            }
            this.selectedIndex = next;
            this.updateList();
        }
        else if (kb.matches(keyData, "selectDown") || keyData === "j") {
            let next = this.selectedIndex + 1;
            if (next >= this.options.length)
                next = 0;
            next = this.nextSelectable(next, 1);
            if (this.isSeparator(next)) {
                next = this.nextSelectable(0, 1);
            }
            this.selectedIndex = next;
            this.updateList();
        }
        else if (kb.matches(keyData, "selectConfirm") || keyData === "\n") {
            const selected = this.options[this.selectedIndex];
            if (selected && !this.isSeparator(this.selectedIndex)) {
                this.onSelectCallback(selected);
            }
        }
        else if (kb.matches(keyData, "selectCancel")) {
            this.onCancelCallback();
        }
    }
    dispose() {
        this.countdown?.dispose();
    }
}
//# sourceMappingURL=extension-selector.js.map