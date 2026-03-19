export interface BlobPutResult {
    hash: string;
    path: string;
    get ref(): string;
}
export declare class BlobStore {
    readonly dir: string;
    constructor(dir: string);
    /** Write binary data to the blob store. Idempotent — same content → same hash. */
    put(data: Buffer): BlobPutResult;
    /** Read blob by hash, returns Buffer or null if not found. */
    get(hash: string): Buffer | null;
    /** Check if a blob exists. */
    has(hash: string): boolean;
    /**
     * Remove blobs not referenced by any session file.
     * @param referencedHashes Set of SHA-256 hashes still referenced in session files.
     * @returns Number of orphaned blobs removed.
     */
    gc(referencedHashes: Set<string>): number;
    /** Get total size of all blobs in bytes, or 0 if the directory is empty/unreadable. */
    totalSize(): number;
}
/** Check if a data string is a blob reference. */
export declare function isBlobRef(data: string): boolean;
/** Extract the SHA-256 hash from a blob reference string. Returns null if format is invalid. */
export declare function parseBlobRef(data: string): string | null;
/**
 * Externalize an image's base64 data to the blob store, returning a blob reference.
 * If the data is already a blob reference, returns it unchanged.
 */
export declare function externalizeImageData(blobStore: BlobStore, base64Data: string): string;
/**
 * Resolve a blob reference back to base64 data.
 * If the data is not a blob reference, returns it unchanged.
 * If the blob is missing, returns the ref unchanged.
 */
export declare function resolveImageData(blobStore: BlobStore, data: string): string;
//# sourceMappingURL=blob-store.d.ts.map