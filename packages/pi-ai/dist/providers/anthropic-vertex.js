import { getEnvApiKey } from "../env-api-keys.js";
import { AssistantMessageEventStream } from "../utils/event-stream.js";
import { adjustMaxTokensForThinking, buildBaseOptions } from "./simple-options.js";
import { mapThinkingLevelToEffort, processAnthropicStream, supportsAdaptiveThinking, } from "./anthropic-shared.js";
let _AnthropicVertexClass;
let _AnthropicSdkClass;
async function getAnthropicVertexClass() {
    if (!_AnthropicVertexClass) {
        const mod = await import("@anthropic-ai/vertex-sdk");
        _AnthropicVertexClass = mod.AnthropicVertex;
    }
    return _AnthropicVertexClass;
}
async function getAnthropicSdkClass() {
    if (!_AnthropicSdkClass) {
        const mod = await import("@anthropic-ai/sdk");
        _AnthropicSdkClass = mod.default;
    }
    return _AnthropicSdkClass;
}
function resolveProjectId() {
    const projectId = process.env.ANTHROPIC_VERTEX_PROJECT_ID
        || process.env.GOOGLE_CLOUD_PROJECT
        || process.env.GCLOUD_PROJECT;
    if (!projectId) {
        throw new Error("Anthropic Vertex requires a project ID. Set ANTHROPIC_VERTEX_PROJECT_ID, GOOGLE_CLOUD_PROJECT, or GCLOUD_PROJECT.");
    }
    return projectId;
}
function resolveRegion() {
    return process.env.CLOUD_ML_REGION
        || process.env.GOOGLE_CLOUD_LOCATION
        || "us-central1";
}
async function createVertexClient() {
    const AnthropicVertexClass = await getAnthropicVertexClass();
    const projectId = resolveProjectId();
    const region = resolveRegion();
    return new AnthropicVertexClass({
        projectId,
        region,
    });
}
export const streamAnthropicVertex = (model, context, options) => {
    const stream = new AssistantMessageEventStream();
    (async () => {
        const client = await createVertexClient();
        const AnthropicSdk = await getAnthropicSdkClass();
        processAnthropicStream(stream, {
            // AnthropicVertex extends Anthropic, so this cast is safe
            client: client,
            model,
            context,
            isOAuthToken: false,
            options,
            AnthropicSdkClass: AnthropicSdk,
        });
    })();
    return stream;
};
export const streamSimpleAnthropicVertex = (model, context, options) => {
    const apiKey = options?.apiKey || getEnvApiKey(model.provider);
    if (!apiKey) {
        throw new Error(`No API key found for provider: ${model.provider}. Set ANTHROPIC_VERTEX_PROJECT_ID to use Claude on Vertex AI.`);
    }
    const base = buildBaseOptions(model, options, apiKey);
    if (!options?.reasoning) {
        return streamAnthropicVertex(model, context, { ...base, thinkingEnabled: false });
    }
    if (supportsAdaptiveThinking(model.id)) {
        const effort = mapThinkingLevelToEffort(options.reasoning, model.id);
        return streamAnthropicVertex(model, context, {
            ...base,
            thinkingEnabled: true,
            effort,
        });
    }
    const adjusted = adjustMaxTokensForThinking(base.maxTokens || 0, model.maxTokens, options.reasoning, options.thinkingBudgets);
    return streamAnthropicVertex(model, context, {
        ...base,
        maxTokens: adjusted.maxTokens,
        thinkingEnabled: true,
        thinkingBudgetTokens: adjusted.thinkingBudget,
    });
};
//# sourceMappingURL=anthropic-vertex.js.map