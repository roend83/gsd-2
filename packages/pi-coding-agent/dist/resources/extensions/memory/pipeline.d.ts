/**
 * Memory extraction pipeline orchestration.
 *
 * Two-phase pipeline:
 * - Phase 1: Scan session .jsonl files, extract durable knowledge via LLM
 * - Phase 2: Consolidate all extractions into MEMORY.md and memory_summary.md
 */
import type { MemoryStorage } from "./storage.js";
export type LLMCallFn = (system: string, user: string, options?: {
    maxTokens?: number;
}) => Promise<string>;
export interface PipelineConfig {
    sessionsDir: string;
    memoryDir: string;
    cwd: string;
    maxRolloutsPerStartup: number;
    maxRolloutAgeDays: number;
    minRolloutIdleHours: number;
    stage1Concurrency: number;
}
/**
 * Run the full pipeline startup sequence.
 */
export declare function runStartup(storage: MemoryStorage, config: PipelineConfig, llmCall: LLMCallFn): Promise<{
    phase1: {
        processed: number;
        errors: number;
    };
    phase2: boolean;
}>;
/**
 * Get the memory summary for injection into the system prompt.
 */
export declare function getMemorySummary(memoryDir: string): string | null;
/**
 * Get the full MEMORY.md content.
 */
export declare function getFullMemory(memoryDir: string): string | null;
//# sourceMappingURL=pipeline.d.ts.map