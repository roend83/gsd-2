/**
 * List available models with optional fuzzy search and discovery support
 */
import type { ModelRegistry } from "../core/model-registry.js";
export interface ListModelsOptions {
    /** Include discovered models in output */
    discover?: boolean;
    /** Search pattern for fuzzy filtering */
    searchPattern?: string;
}
/**
 * Discover models from provider APIs and print results.
 */
export declare function discoverAndPrintModels(modelRegistry: ModelRegistry, provider?: string): Promise<void>;
/**
 * List available models, optionally filtered by search pattern.
 * Accepts either a string (backward compat) or ListModelsOptions.
 */
export declare function listModels(modelRegistry: ModelRegistry, optionsOrSearch?: string | ListModelsOptions): Promise<void>;
//# sourceMappingURL=list-models.d.ts.map