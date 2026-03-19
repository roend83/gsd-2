/**
 * Credential storage for API keys and OAuth tokens.
 * Handles loading, saving, and refreshing credentials from auth.json.
 *
 * Supports multiple credentials per provider with round-robin selection,
 * session-sticky hashing, and automatic rate-limit fallback.
 *
 * Uses file locking to prevent race conditions when multiple pi instances
 * try to refresh tokens simultaneously.
 */
import { type OAuthCredentials, type OAuthLoginCallbacks, type OAuthProviderId } from "@gsd/pi-ai";
export type ApiKeyCredential = {
    type: "api_key";
    key: string;
};
export type OAuthCredential = {
    type: "oauth";
} & OAuthCredentials;
export type AuthCredential = ApiKeyCredential | OAuthCredential;
/**
 * On-disk format: each provider maps to a single credential or an array of credentials.
 * Single credentials are normalized to arrays at load time for internal use.
 */
export type AuthStorageData = Record<string, AuthCredential | AuthCredential[]>;
type LockResult<T> = {
    result: T;
    next?: string;
};
export interface AuthStorageBackend {
    withLock<T>(fn: (current: string | undefined) => LockResult<T>): T;
    withLockAsync<T>(fn: (current: string | undefined) => Promise<LockResult<T>>): Promise<T>;
}
export declare class FileAuthStorageBackend implements AuthStorageBackend {
    private authPath;
    constructor(authPath?: string);
    private ensureParentDir;
    private ensureFileExists;
    private acquireLockSyncWithRetry;
    withLock<T>(fn: (current: string | undefined) => LockResult<T>): T;
    withLockAsync<T>(fn: (current: string | undefined) => Promise<LockResult<T>>): Promise<T>;
}
export declare class InMemoryAuthStorageBackend implements AuthStorageBackend {
    private value;
    withLock<T>(fn: (current: string | undefined) => LockResult<T>): T;
    withLockAsync<T>(fn: (current: string | undefined) => Promise<LockResult<T>>): Promise<T>;
}
export type UsageLimitErrorType = "rate_limit" | "quota_exhausted" | "server_error" | "unknown";
/**
 * Credential storage backed by a JSON file.
 * Supports multiple credentials per provider with round-robin rotation and rate-limit fallback.
 */
export declare class AuthStorage {
    private storage;
    private data;
    private runtimeOverrides;
    private fallbackResolver?;
    private loadError;
    private errors;
    /**
     * Round-robin index per provider. Incremented on each call to getApiKey
     * when no sessionId is provided.
     */
    private providerRoundRobinIndex;
    /**
     * Backoff tracking per provider per credential index.
     * Map<provider, Map<credentialIndex, backoffExpiresAt>>
     */
    private credentialBackoff;
    /**
     * Provider-level backoff tracking.
     * Set when all credentials for a provider are backed off.
     * Map<provider, backoffExpiresAt>
     */
    private providerBackoff;
    private constructor();
    static create(authPath?: string): AuthStorage;
    static fromStorage(storage: AuthStorageBackend): AuthStorage;
    static inMemory(data?: AuthStorageData): AuthStorage;
    /**
     * Set a runtime API key override (not persisted to disk).
     * Used for CLI --api-key flag.
     */
    setRuntimeApiKey(provider: string, apiKey: string): void;
    /**
     * Remove a runtime API key override.
     */
    removeRuntimeApiKey(provider: string): void;
    /**
     * Set a fallback resolver for API keys not found in auth.json or env vars.
     * Used for custom provider keys from models.json.
     */
    setFallbackResolver(resolver: (provider: string) => string | undefined): void;
    private recordError;
    private parseStorageData;
    /**
     * Normalize a storage entry to an array of credentials.
     * Handles both single credential (backward compat) and array formats.
     */
    getCredentialsForProvider(provider: string): AuthCredential[];
    /**
     * Reload credentials from storage.
     */
    reload(): void;
    private persistProviderChange;
    /**
     * Get the first credential for a provider (backward-compatible).
     */
    get(provider: string): AuthCredential | undefined;
    /**
     * Set credential for a provider. For API key credentials, appends to
     * existing credentials (accumulation on duplicate login). For OAuth,
     * replaces (only one OAuth token per provider makes sense).
     */
    set(provider: string, credential: AuthCredential): void;
    /**
     * Remove all credentials for a provider.
     */
    remove(provider: string): void;
    /**
     * List all providers with credentials.
     */
    list(): string[];
    /**
     * Check if credentials exist for a provider in auth.json.
     */
    has(provider: string): boolean;
    /**
     * Check if any form of auth is configured for a provider.
     * Unlike getApiKey(), this doesn't refresh OAuth tokens.
     */
    hasAuth(provider: string): boolean;
    /**
     * Get all credentials (for passing to getOAuthApiKey).
     * Returns normalized format where each provider has a single credential
     * (the first one) for backward compatibility with OAuth refresh.
     *
     * NOTE: For providers with multiple API keys, only the first credential is
     * returned. This is intentional — callers use this for OAuth refresh only,
     * which is always single-credential. Do not use for API key enumeration.
     */
    getAll(): Record<string, AuthCredential>;
    drainErrors(): Error[];
    /**
     * Login to an OAuth provider.
     */
    login(providerId: OAuthProviderId, callbacks: OAuthLoginCallbacks): Promise<void>;
    /**
     * Logout from a provider.
     */
    logout(provider: string): void;
    /**
     * Returns true when the provider has credentials configured but all of them
     * are currently in a backoff window (e.g. rate-limited or quota exhausted).
     * Returns false when there are no credentials or at least one is available.
     */
    areAllCredentialsBackedOff(provider: string): boolean;
    /**
     * Mark an entire provider as exhausted.
     * Called when all credentials for a provider are backed off.
     */
    markProviderExhausted(provider: string, errorType: UsageLimitErrorType): void;
    /**
     * Check if a provider is currently available (not backed off at provider level).
     */
    isProviderAvailable(provider: string): boolean;
    /**
     * Get milliseconds remaining until provider backoff expires.
     * Returns 0 if provider is available.
     */
    getProviderBackoffRemaining(provider: string): number;
    /**
     * Check if a credential index is currently backed off.
     */
    private isCredentialBackedOff;
    /**
     * Select the best credential index for a provider.
     * - If sessionId is provided, uses session-sticky hashing as the starting point.
     * - Otherwise, uses round-robin as the starting point.
     * - Skips credentials that are currently backed off.
     * - Returns -1 if all credentials are backed off.
     */
    private selectCredentialIndex;
    /**
     * Mark a credential as rate-limited. Finds the credential that was most
     * recently used for this provider+session and backs it off.
     *
     * @returns true if another credential is available (caller should retry),
     *          false if all credentials for this provider are backed off.
     */
    markUsageLimitReached(provider: string, sessionId?: string, options?: {
        errorType?: UsageLimitErrorType;
    }): boolean;
    /**
     * Refresh OAuth token with backend locking to prevent race conditions.
     * Multiple pi instances may try to refresh simultaneously when tokens expire.
     */
    private refreshOAuthTokenWithLock;
    /**
     * Resolve an API key from a single credential.
     */
    private resolveCredentialApiKey;
    /**
     * Get API key for a provider.
     * Priority:
     * 1. Runtime override (CLI --api-key)
     * 2. Credential(s) from auth.json (with round-robin / session-sticky selection)
     * 3. Environment variable
     * 4. Fallback resolver (models.json custom providers)
     *
     * @param providerId - The provider to get an API key for
     * @param sessionId - Optional session ID for sticky credential selection
     */
    getApiKey(providerId: string, sessionId?: string): Promise<string | undefined>;
    /**
     * Get all registered OAuth providers
     */
    getOAuthProviders(): import("@gsd/pi-ai").OAuthProviderInterface[];
}
export {};
//# sourceMappingURL=auth-storage.d.ts.map