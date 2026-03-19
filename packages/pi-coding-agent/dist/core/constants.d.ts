/**
 * Centralized configuration constants for the coding agent.
 *
 * Values grouped by subsystem. Each constant documents where it is consumed
 * so that changes can be audited in one place.
 */
/** Shell command execution timeout used by resolve-config-value. */
export declare const COMMAND_EXECUTION_TIMEOUT_MS = 10000;
/** LSP server liveness check timeout (lspmux). */
export declare const LSP_LIVENESS_TIMEOUT_MS = 1000;
/** Staleness threshold for the async auth-storage file lock. */
export declare const AUTH_LOCK_STALE_MS = 30000;
/** TTL for the cached lspmux state detection result. */
export declare const LSP_STATE_CACHE_TTL_MS: number;
/** Tokens reserved for the LLM prompt + response during compaction and branch summarization. */
export declare const COMPACTION_RESERVE_TOKENS = 16384;
/** Tokens from the tail of the conversation kept verbatim after compaction. */
export declare const COMPACTION_KEEP_RECENT_TOKENS = 20000;
/** Max characters kept per tool-result block when serializing for summarization. */
export declare const TOOL_RESULT_MAX_CHARS = 2000;
/** Base delay for exponential back-off retries (2 s, 4 s, 8 s ...). */
export declare const RETRY_BASE_DELAY_MS = 2000;
/** Maximum server-requested delay before the retry loop gives up. */
export declare const RETRY_MAX_DELAY_MS = 300000;
/** Default result-count cap for the find/glob tool. */
export declare const FIND_DEFAULT_LIMIT = 1000;
/** Default line-count cap for tool-output truncation. */
export declare const TRUNCATE_DEFAULT_MAX_LINES = 2000;
//# sourceMappingURL=constants.d.ts.map