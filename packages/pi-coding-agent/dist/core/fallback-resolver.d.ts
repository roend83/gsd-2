/**
 * FallbackResolver - Cross-provider fallback when rate/quota limits are hit.
 *
 * When a provider's credentials are all exhausted, this resolver finds the next
 * available provider+model from a user-configured fallback chain. It also handles
 * restoration: checking if a higher-priority provider has recovered before each request.
 */
import type { Api, Model } from "@gsd/pi-ai";
import type { AuthStorage, UsageLimitErrorType } from "./auth-storage.js";
import type { ModelRegistry } from "./model-registry.js";
import type { SettingsManager } from "./settings-manager.js";
export interface FallbackResult {
    model: Model<Api>;
    chainName: string;
    reason: string;
}
export declare class FallbackResolver {
    private settingsManager;
    private authStorage;
    private modelRegistry;
    constructor(settingsManager: SettingsManager, authStorage: AuthStorage, modelRegistry: ModelRegistry);
    /**
     * Find the next available fallback for a model that just failed.
     * Searches all chains for entries matching the current model's provider+id,
     * then returns the next available entry with lower priority (higher number).
     *
     * @returns FallbackResult if a fallback is available, null otherwise
     */
    findFallback(currentModel: Model<Api>, errorType: UsageLimitErrorType): Promise<FallbackResult | null>;
    /**
     * Check if a higher-priority provider in the chain has recovered.
     * Called before each LLM request to restore the best available provider.
     *
     * @returns FallbackResult if a better provider is available, null if current is best
     */
    checkForRestoration(currentModel: Model<Api>): Promise<FallbackResult | null>;
    /**
     * Get the best available model from a named chain.
     * Useful for initial model selection.
     */
    getBestAvailable(chainName: string): Promise<FallbackResult | null>;
    /**
     * Find the chain(s) a model belongs to.
     */
    findChainsForModel(provider: string, modelId: string): string[];
    /**
     * Search a chain for the first available entry starting from startIndex.
     */
    private _findAvailableInChain;
}
//# sourceMappingURL=fallback-resolver.d.ts.map