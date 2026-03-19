/**
 * Generic selector component for extensions.
 * Displays a list of string options with keyboard navigation.
 * Options starting with SEPARATOR_PREFIX are rendered as non-selectable group headers.
 */
import { Container, type TUI } from "@gsd/pi-tui";
/** Prefix that marks an option as a non-selectable group header. */
export declare const SEPARATOR_PREFIX = "\u2500\u2500\u2500";
export interface ExtensionSelectorOptions {
    tui?: TUI;
    timeout?: number;
}
export declare class ExtensionSelectorComponent extends Container {
    private options;
    private selectedIndex;
    private listContainer;
    private onSelectCallback;
    private onCancelCallback;
    private titleText;
    private baseTitle;
    private countdown;
    constructor(title: string, options: string[], onSelect: (option: string) => void, onCancel: () => void, opts?: ExtensionSelectorOptions);
    private isSeparator;
    /**
     * Find the next selectable index starting from `from` in the given direction.
     * Returns `from` clamped to bounds if nothing selectable is found.
     */
    private nextSelectable;
    private updateList;
    handleInput(keyData: string): void;
    dispose(): void;
}
//# sourceMappingURL=extension-selector.d.ts.map