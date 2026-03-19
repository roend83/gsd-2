/**
 * Manages artifact storage for a session.
 *
 * Artifacts are stored with sequential IDs in the session's artifact directory.
 * The directory is created lazily on first write.
 */
export declare class ArtifactManager {
    #private;
    /**
     * @param sessionFile Path to the session .jsonl file
     */
    constructor(sessionFile: string);
    /**
     * Artifact directory path.
     * Directory may not exist until first artifact is saved.
     */
    get dir(): string;
    /** Atomically allocate next artifact ID. */
    allocateId(): number;
    /**
     * Allocate a new artifact path and ID without writing content.
     * @param toolType Tool name for file extension (e.g., "bash", "fetch")
     */
    allocatePath(toolType: string): {
        id: string;
        path: string;
    };
    /**
     * Save content as an artifact and return the artifact ID.
     * @param content Full content to save
     * @param toolType Tool name for file extension (e.g., "bash", "fetch")
     * @returns Artifact ID (numeric string)
     */
    save(content: string, toolType: string): string;
    /**
     * Check if an artifact exists.
     * @param id Artifact ID (numeric string)
     */
    exists(id: string): boolean;
    /**
     * List all artifact files in the directory.
     * Returns empty array if directory doesn't exist.
     */
    listFiles(): string[];
    /**
     * Get the full path to an artifact file.
     * Returns null if artifact doesn't exist.
     * @param id Artifact ID (numeric string)
     */
    getPath(id: string): string | null;
}
//# sourceMappingURL=artifact-manager.d.ts.map