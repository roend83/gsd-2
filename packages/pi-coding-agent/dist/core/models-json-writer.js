/**
 * Safe read-modify-write for models.json with file locking.
 * Prevents concurrent writes from corrupting the config file.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import lockfile from "proper-lockfile";
import { getAgentDir } from "../config.js";
export class ModelsJsonWriter {
    constructor(modelsJsonPath) {
        this.modelsJsonPath = modelsJsonPath ?? join(getAgentDir(), "models.json");
    }
    /**
     * Add a model to a provider. Creates the provider if it doesn't exist.
     */
    addModel(provider, model, providerConfig) {
        this.withLock((config) => {
            if (!config.providers[provider]) {
                config.providers[provider] = {
                    ...providerConfig,
                    models: [],
                };
            }
            const providerEntry = config.providers[provider];
            if (!providerEntry.models) {
                providerEntry.models = [];
            }
            // Replace existing model with same id, or append
            const existingIndex = providerEntry.models.findIndex((m) => m.id === model.id);
            if (existingIndex >= 0) {
                providerEntry.models[existingIndex] = model;
            }
            else {
                providerEntry.models.push(model);
            }
            return config;
        });
    }
    /**
     * Remove a model from a provider. Removes the provider if no models remain.
     */
    removeModel(provider, modelId) {
        this.withLock((config) => {
            const providerEntry = config.providers[provider];
            if (!providerEntry?.models)
                return config;
            providerEntry.models = providerEntry.models.filter((m) => m.id !== modelId);
            // Clean up empty provider (no models and no overrides)
            if (providerEntry.models.length === 0 && !providerEntry.modelOverrides) {
                delete config.providers[provider];
            }
            return config;
        });
    }
    /**
     * Set or update an entire provider configuration.
     */
    setProvider(provider, providerConfig) {
        this.withLock((config) => {
            config.providers[provider] = providerConfig;
            return config;
        });
    }
    /**
     * Remove a provider and all its models.
     */
    removeProvider(provider) {
        this.withLock((config) => {
            delete config.providers[provider];
            return config;
        });
    }
    /**
     * List all providers and their configurations.
     */
    listProviders() {
        return this.readConfig();
    }
    readConfig() {
        if (!existsSync(this.modelsJsonPath)) {
            return { providers: {} };
        }
        try {
            const content = readFileSync(this.modelsJsonPath, "utf-8");
            return JSON.parse(content);
        }
        catch {
            return { providers: {} };
        }
    }
    writeConfig(config) {
        const dir = dirname(this.modelsJsonPath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        writeFileSync(this.modelsJsonPath, JSON.stringify(config, null, 2), "utf-8");
    }
    acquireLockWithRetry() {
        const maxAttempts = 10;
        const delayMs = 20;
        let lastError;
        // Ensure file exists for locking
        const dir = dirname(this.modelsJsonPath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        if (!existsSync(this.modelsJsonPath)) {
            writeFileSync(this.modelsJsonPath, JSON.stringify({ providers: {} }, null, 2), "utf-8");
        }
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return lockfile.lockSync(this.modelsJsonPath, { realpath: false });
            }
            catch (error) {
                const code = typeof error === "object" && error !== null && "code" in error
                    ? String(error.code)
                    : undefined;
                if (code !== "ELOCKED" || attempt === maxAttempts) {
                    throw error;
                }
                lastError = error;
                const start = Date.now();
                while (Date.now() - start < delayMs) {
                    // Busy-wait (same pattern as auth-storage.ts)
                }
            }
        }
        throw lastError ?? new Error("Failed to acquire models.json lock");
    }
    withLock(fn) {
        let release;
        try {
            release = this.acquireLockWithRetry();
            const config = this.readConfig();
            const updated = fn(config);
            this.writeConfig(updated);
        }
        finally {
            if (release) {
                release();
            }
        }
    }
}
//# sourceMappingURL=models-json-writer.js.map