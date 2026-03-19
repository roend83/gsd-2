/**
 * SQLite storage for the memory extraction pipeline.
 *
 * Tables:
 * - threads: tracks session files and their processing state
 * - stage1_outputs: stores per-thread extraction results
 * - jobs: lease-based job queue for pipeline phases
 */
export interface ThreadRow {
    thread_id: string;
    file_path: string;
    file_size: number;
    file_mtime: number;
    cwd: string;
    status: "pending" | "processing" | "done" | "error";
    error_message: string | null;
    created_at: string;
    updated_at: string;
}
export interface Stage1OutputRow {
    thread_id: string;
    extraction_json: string;
    created_at: string;
}
export interface JobRow {
    id: string;
    phase: "stage1" | "stage2";
    thread_id: string | null;
    status: "pending" | "claimed" | "done" | "error";
    worker_id: string | null;
    ownership_token: string | null;
    lease_expires_at: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
}
export declare class MemoryStorage {
    private db;
    private dbPath;
    private persistTimer;
    private constructor();
    static create(dbPath: string): Promise<MemoryStorage>;
    private persist;
    private schedulePersist;
    private initSchema;
    private queryAll;
    private queryOne;
    /**
     * Insert or update thread records. Skips threads whose file hasn't changed
     * (same size + mtime = watermark match).
     */
    upsertThreads(threads: Array<{
        threadId: string;
        filePath: string;
        fileSize: number;
        fileMtime: number;
        cwd: string;
    }>): {
        inserted: number;
        updated: number;
        skipped: number;
    };
    /**
     * Claim up to `limit` stage1 jobs for the given worker.
     * Uses lease-based ownership with an ownership_token UUID.
     */
    claimStage1Jobs(workerId: string, limit: number, leaseSeconds: number): Array<{
        jobId: string;
        threadId: string;
        ownershipToken: string;
    }>;
    /**
     * Mark a stage1 job as complete and store the extraction output.
     */
    completeStage1Job(threadId: string, output: string): void;
    /**
     * Mark a stage1 job as errored.
     */
    failStage1Job(threadId: string, errorMessage: string): void;
    /**
     * Try to claim the global phase 2 consolidation job.
     * Only one worker can hold this at a time.
     */
    tryClaimGlobalPhase2Job(workerId: string, leaseSeconds: number): {
        jobId: string;
        ownershipToken: string;
    } | null;
    /**
     * Complete the phase 2 consolidation job.
     */
    completePhase2Job(jobId: string): void;
    /**
     * Get all stage1 extraction outputs.
     */
    getStage1Outputs(): Array<{
        threadId: string;
        extractionJson: string;
    }>;
    /**
     * Get all stage1 outputs for a specific cwd.
     */
    getStage1OutputsForCwd(cwd: string): Array<{
        threadId: string;
        extractionJson: string;
    }>;
    /**
     * Get thread info by ID.
     */
    getThread(threadId: string): ThreadRow | undefined;
    /**
     * Get pipeline statistics.
     */
    getStats(): {
        totalThreads: number;
        pendingThreads: number;
        doneThreads: number;
        errorThreads: number;
        totalStage1Outputs: number;
        pendingStage1Jobs: number;
    };
    /**
     * Clear all data (for /memory clear).
     */
    clearAll(): void;
    /**
     * Clear data for a specific cwd (for /memory clear in project scope).
     */
    clearForCwd(cwd: string): void;
    /**
     * Reset all threads to pending (for /memory rebuild).
     */
    resetAllForCwd(cwd: string): void;
    close(): void;
}
//# sourceMappingURL=storage.d.ts.map