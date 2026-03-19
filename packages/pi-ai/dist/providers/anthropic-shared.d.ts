/**
 * Shared utilities for Anthropic providers (direct API and Vertex AI).
 *
 * Follows the same pattern as google-shared.ts — common message conversion,
 * tool conversion, parameter building, and stream processing shared between
 * anthropic.ts and anthropic-vertex.ts.
 */
import type Anthropic from "@anthropic-ai/sdk";
import type { MessageCreateParamsStreaming, MessageParam } from "@anthropic-ai/sdk/resources/messages.js";
import type { CacheRetention, Context, ImageContent, Message, Model, StopReason, StreamOptions, TextContent, Tool } from "../types.js";
/** API types that use the Anthropic Messages protocol */
export type AnthropicApi = "anthropic-messages" | "anthropic-vertex";
import type { AssistantMessageEventStream } from "../utils/event-stream.js";
export type AnthropicEffort = "low" | "medium" | "high" | "max";
export interface AnthropicOptions extends StreamOptions {
    thinkingEnabled?: boolean;
    thinkingBudgetTokens?: number;
    effort?: AnthropicEffort;
    interleavedThinking?: boolean;
    toolChoice?: "auto" | "any" | "none" | {
        type: "tool";
        name: string;
    };
}
export declare const toClaudeCodeName: (name: string) => string;
export declare const fromClaudeCodeName: (name: string, tools?: Tool[]) => string;
export declare function getCacheControl(baseUrl: string, cacheRetention?: CacheRetention): {
    retention: CacheRetention;
    cacheControl?: {
        type: "ephemeral";
        ttl?: "1h";
    };
};
export declare function convertContentBlocks(content: (TextContent | ImageContent)[]): string | Array<{
    type: "text";
    text: string;
} | {
    type: "image";
    source: {
        type: "base64";
        media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        data: string;
    };
}>;
export declare function supportsAdaptiveThinking(modelId: string): boolean;
export declare function mapThinkingLevelToEffort(level: string | undefined, modelId: string): AnthropicEffort;
export declare function isTransientNetworkError(error: unknown): boolean;
export declare function extractRetryAfterMs(headers: Headers | {
    get(name: string): string | null;
}, errorText?: string): number | undefined;
export declare function normalizeToolCallId(id: string): string;
export declare function convertMessages(messages: Message[], model: Model<AnthropicApi>, isOAuthToken: boolean, cacheControl?: {
    type: "ephemeral";
    ttl?: "1h";
}): MessageParam[];
export declare function convertTools(tools: Tool[], isOAuthToken: boolean): Anthropic.Messages.Tool[];
export declare function buildParams(model: Model<AnthropicApi>, context: Context, isOAuthToken: boolean, options?: AnthropicOptions): MessageCreateParamsStreaming;
export declare function mapStopReason(reason: string): StopReason;
export interface StreamAnthropicArgs {
    client: Anthropic;
    model: Model<AnthropicApi>;
    context: Context;
    isOAuthToken: boolean;
    options?: AnthropicOptions;
    /** Reference to the lazily-loaded Anthropic SDK class for error type checking */
    AnthropicSdkClass?: typeof Anthropic;
}
/**
 * Shared streaming implementation used by both anthropic and anthropic-vertex providers.
 * Creates the message stream, processes events, and emits to the AssistantMessageEventStream.
 */
export declare function processAnthropicStream(stream: AssistantMessageEventStream, args: StreamAnthropicArgs): void;
//# sourceMappingURL=anthropic-shared.d.ts.map