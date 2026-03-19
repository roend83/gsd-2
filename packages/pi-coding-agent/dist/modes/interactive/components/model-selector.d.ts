import { type Model } from "@gsd/pi-ai";
import { Container, type Focusable, Input, type TUI } from "@gsd/pi-tui";
import type { ModelRegistry } from "../../../core/model-registry.js";
import type { SettingsManager } from "../../../core/settings-manager.js";
interface ScopedModelItem {
    model: Model<any>;
    thinkingLevel?: string;
}
/**
 * Component that renders a grouped model selector with search.
 *
 * Browsing (no search): models are grouped under provider headers.
 *   - Current model's provider is shown first; remaining providers sorted alphabetically.
 *   - Arrow keys navigate all rows; headers are skipped during selection.
 * Searching: reverts to a flat fuzzy-filtered list (same as before), with [provider] badges.
 */
export declare class ModelSelectorComponent extends Container implements Focusable {
    private searchInput;
    private _focused;
    get focused(): boolean;
    set focused(value: boolean);
    private listContainer;
    private allModels;
    private scopedModelItems;
    private activeModels;
    private groupedRows;
    private modelRowIndices;
    private selectedGroupIndex;
    private filteredModels;
    private selectedFlatIndex;
    private isSearching;
    private currentModel?;
    private settingsManager;
    private modelRegistry;
    private onSelectCallback;
    private onCancelCallback;
    private errorMessage?;
    private tui;
    private scopedModels;
    private scope;
    private scopeText?;
    private scopeHintText?;
    constructor(tui: TUI, currentModel: Model<any> | undefined, settingsManager: SettingsManager, modelRegistry: ModelRegistry, scopedModels: ReadonlyArray<ScopedModelItem>, onSelect: (model: Model<any>) => void, onCancel: () => void, initialSearchInput?: string);
    private loadModels;
    /**
     * Sort models within each provider: current model first, then by name desc.
     * Provider ordering is handled separately in buildGroupedRows().
     */
    private sortModelsWithinProvider;
    /**
     * Build the grouped rows array for browse mode.
     * Current model's provider comes first; remaining providers sorted alphabetically.
     */
    private buildGroupedRows;
    /**
     * Move selectedGroupIndex to point at the current model (or first model).
     */
    private jumpToCurrentModel;
    /**
     * Get the currently selected model from grouped or flat state.
     */
    private getSelectedModel;
    private getScopeText;
    private getScopeHintText;
    private setScope;
    private filterModels;
    private updateList;
    /** Flat fuzzy-search results, same as original behaviour */
    private renderFlatList;
    /**
     * Grouped browse view: provider headers + model rows, windowed around selection.
     * Shows enough rows to fill ~10 visible lines; headers count as one line each.
     */
    private renderGroupedList;
    private modelDetailLine;
    handleInput(keyData: string): void;
    /** Move selection up, skipping headers in grouped mode */
    private moveUp;
    /** Move selection down, skipping headers in grouped mode */
    private moveDown;
    private handleSelect;
    getSearchInput(): Input;
}
export {};
//# sourceMappingURL=model-selector.d.ts.map