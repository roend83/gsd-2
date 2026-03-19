/**
 * TUI component for managing provider configurations.
 * Shows providers with auth status, discovery support, and model counts.
 */
import { Container, type Focusable, type TUI } from "@gsd/pi-tui";
import type { AuthStorage } from "../../../core/auth-storage.js";
import type { ModelRegistry } from "../../../core/model-registry.js";
export declare class ProviderManagerComponent extends Container implements Focusable {
    private _focused;
    get focused(): boolean;
    set focused(value: boolean);
    private providers;
    private selectedIndex;
    private listContainer;
    private tui;
    private authStorage;
    private modelRegistry;
    private onDone;
    private onDiscover;
    constructor(tui: TUI, authStorage: AuthStorage, modelRegistry: ModelRegistry, onDone: () => void, onDiscover: (provider: string) => void);
    private loadProviders;
    private updateList;
    handleInput(keyData: string): void;
}
//# sourceMappingURL=provider-manager.d.ts.map