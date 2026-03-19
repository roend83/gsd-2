import type { SimpleStreamOptions, StreamFunction } from "../types.js";
import { type AnthropicEffort, type AnthropicOptions, extractRetryAfterMs } from "./anthropic-shared.js";
export type { AnthropicEffort, AnthropicOptions };
export { extractRetryAfterMs };
export declare const streamAnthropic: StreamFunction<"anthropic-messages", AnthropicOptions>;
export declare const streamSimpleAnthropic: StreamFunction<"anthropic-messages", SimpleStreamOptions>;
//# sourceMappingURL=anthropic.d.ts.map