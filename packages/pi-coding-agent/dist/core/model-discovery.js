/**
 * Provider discovery adapters for runtime model enumeration.
 * Each adapter implements ProviderDiscoveryAdapter to fetch models from provider APIs.
 */
/** Per-provider TTLs in milliseconds */
export const DISCOVERY_TTLS = {
    ollama: 5 * 60 * 1000, // 5 minutes (local, models change often)
    openai: 60 * 60 * 1000, // 1 hour
    google: 60 * 60 * 1000, // 1 hour
    openrouter: 60 * 60 * 1000, // 1 hour
    default: 24 * 60 * 60 * 1000, // 24 hours
};
export function getDefaultTTL(provider) {
    return DISCOVERY_TTLS[provider] ?? DISCOVERY_TTLS.default;
}
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    }
    finally {
        clearTimeout(timeout);
    }
}
// ─── OpenAI Adapter ──────────────────────────────────────────────────────────
const OPENAI_EXCLUDED_PREFIXES = ["embedding", "tts", "dall-e", "whisper", "text-embedding", "davinci", "babbage"];
class OpenAIDiscoveryAdapter {
    constructor() {
        this.provider = "openai";
        this.supportsDiscovery = true;
    }
    async fetchModels(apiKey, baseUrl) {
        const url = `${baseUrl ?? "https://api.openai.com"}/v1/models`;
        const response = await fetchWithTimeout(url, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!response.ok) {
            throw new Error(`OpenAI models API returned ${response.status}: ${response.statusText}`);
        }
        const data = (await response.json());
        return data.data
            .filter((m) => !OPENAI_EXCLUDED_PREFIXES.some((prefix) => m.id.startsWith(prefix)))
            .map((m) => ({
            id: m.id,
            name: m.id,
            input: ["text", "image"],
        }));
    }
}
// ─── Ollama Adapter ──────────────────────────────────────────────────────────
class OllamaDiscoveryAdapter {
    constructor() {
        this.provider = "ollama";
        this.supportsDiscovery = true;
    }
    async fetchModels(_apiKey, baseUrl) {
        const url = `${baseUrl ?? "http://localhost:11434"}/api/tags`;
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
            throw new Error(`Ollama tags API returned ${response.status}: ${response.statusText}`);
        }
        const data = (await response.json());
        return (data.models ?? []).map((m) => ({
            id: m.name,
            name: m.name,
            input: ["text"],
        }));
    }
}
// ─── OpenRouter Adapter ──────────────────────────────────────────────────────
class OpenRouterDiscoveryAdapter {
    constructor() {
        this.provider = "openrouter";
        this.supportsDiscovery = true;
    }
    async fetchModels(apiKey, baseUrl) {
        const url = `${baseUrl ?? "https://openrouter.ai"}/api/v1/models`;
        const response = await fetchWithTimeout(url, {
            headers: { Authorization: `Bearer ${apiKey}` },
        });
        if (!response.ok) {
            throw new Error(`OpenRouter models API returned ${response.status}: ${response.statusText}`);
        }
        const data = (await response.json());
        return (data.data ?? []).map((m) => {
            const cost = m.pricing?.prompt !== undefined && m.pricing?.completion !== undefined
                ? {
                    input: parseFloat(m.pricing.prompt) * 1_000_000,
                    output: parseFloat(m.pricing.completion) * 1_000_000,
                    cacheRead: 0,
                    cacheWrite: 0,
                }
                : undefined;
            return {
                id: m.id,
                name: m.name,
                contextWindow: m.context_length,
                maxTokens: m.top_provider?.max_completion_tokens,
                cost,
                input: ["text", "image"],
            };
        });
    }
}
// ─── Google/Gemini Adapter ───────────────────────────────────────────────────
class GoogleDiscoveryAdapter {
    constructor() {
        this.provider = "google";
        this.supportsDiscovery = true;
    }
    async fetchModels(apiKey, baseUrl) {
        const url = `${baseUrl ?? "https://generativelanguage.googleapis.com"}/v1beta/models?key=${apiKey}`;
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
            throw new Error(`Google models API returned ${response.status}: ${response.statusText}`);
        }
        const data = (await response.json());
        return (data.models ?? [])
            .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
            .map((m) => ({
            id: m.name.replace("models/", ""),
            name: m.displayName,
            contextWindow: m.inputTokenLimit,
            maxTokens: m.outputTokenLimit,
            input: ["text", "image"],
        }));
    }
}
// ─── Static Adapter (no discovery) ───────────────────────────────────────────
class StaticDiscoveryAdapter {
    constructor(provider) {
        this.supportsDiscovery = false;
        this.provider = provider;
    }
    async fetchModels() {
        return [];
    }
}
// ─── Registry ────────────────────────────────────────────────────────────────
const adapters = {
    openai: new OpenAIDiscoveryAdapter(),
    ollama: new OllamaDiscoveryAdapter(),
    openrouter: new OpenRouterDiscoveryAdapter(),
    google: new GoogleDiscoveryAdapter(),
    anthropic: new StaticDiscoveryAdapter("anthropic"),
    bedrock: new StaticDiscoveryAdapter("bedrock"),
    "azure-openai": new StaticDiscoveryAdapter("azure-openai"),
    groq: new StaticDiscoveryAdapter("groq"),
    cerebras: new StaticDiscoveryAdapter("cerebras"),
    xai: new StaticDiscoveryAdapter("xai"),
    mistral: new StaticDiscoveryAdapter("mistral"),
};
export function getDiscoveryAdapter(provider) {
    return adapters[provider] ?? new StaticDiscoveryAdapter(provider);
}
export function getDiscoverableProviders() {
    return Object.entries(adapters)
        .filter(([, adapter]) => adapter.supportsDiscovery)
        .map(([name]) => name);
}
//# sourceMappingURL=model-discovery.js.map