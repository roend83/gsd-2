/**
 * Provider discovery adapters for runtime model enumeration.
 * Each adapter implements ProviderDiscoveryAdapter to fetch models from provider APIs.
 */
export interface DiscoveredModel {
    id: string;
    name?: string;
    contextWindow?: number;
    maxTokens?: number;
    reasoning?: boolean;
    input?: ("text" | "image")[];
    cost?: {
        input: number;
        output: number;
        cacheRead: number;
        cacheWrite: number;
    };
}
export interface DiscoveryResult {
    provider: string;
    models: DiscoveredModel[];
    fetchedAt: number;
    error?: string;
}
export interface ProviderDiscoveryAdapter {
    provider: string;
    supportsDiscovery: boolean;
    fetchModels(apiKey: string, baseUrl?: string): Promise<DiscoveredModel[]>;
}
/** Per-provider TTLs in milliseconds */
export declare const DISCOVERY_TTLS: Record<string, number>;
export declare function getDefaultTTL(provider: string): number;
export declare function getDiscoveryAdapter(provider: string): ProviderDiscoveryAdapter;
export declare function getDiscoverableProviders(): string[];
//# sourceMappingURL=model-discovery.d.ts.map