/**
 * Safe read-modify-write for models.json with file locking.
 * Prevents concurrent writes from corrupting the config file.
 */
interface ModelDefinition {
    id: string;
    name?: string;
    api?: string;
    baseUrl?: string;
    reasoning?: boolean;
    input?: ("text" | "image")[];
    cost?: {
        input: number;
        output: number;
        cacheRead: number;
        cacheWrite: number;
    };
    contextWindow?: number;
    maxTokens?: number;
}
interface ProviderConfig {
    baseUrl?: string;
    apiKey?: string;
    api?: string;
    headers?: Record<string, string>;
    authHeader?: boolean;
    models?: ModelDefinition[];
    modelOverrides?: Record<string, Record<string, unknown>>;
}
interface ModelsConfig {
    providers: Record<string, ProviderConfig>;
}
export declare class ModelsJsonWriter {
    private modelsJsonPath;
    constructor(modelsJsonPath?: string);
    /**
     * Add a model to a provider. Creates the provider if it doesn't exist.
     */
    addModel(provider: string, model: ModelDefinition, providerConfig?: Partial<ProviderConfig>): void;
    /**
     * Remove a model from a provider. Removes the provider if no models remain.
     */
    removeModel(provider: string, modelId: string): void;
    /**
     * Set or update an entire provider configuration.
     */
    setProvider(provider: string, providerConfig: ProviderConfig): void;
    /**
     * Remove a provider and all its models.
     */
    removeProvider(provider: string): void;
    /**
     * List all providers and their configurations.
     */
    listProviders(): ModelsConfig;
    private readConfig;
    private writeConfig;
    private acquireLockWithRetry;
    private withLock;
}
export {};
//# sourceMappingURL=models-json-writer.d.ts.map