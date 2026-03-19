/**
 * Unit closeout helper — consolidates the repeated pattern of
 * snapshotting metrics + saving activity log + extracting memories
 * that appears 6+ times in auto.ts.
 */
import { snapshotUnitMetrics } from "./metrics.js";
import { saveActivityLog } from "./activity-log.js";
/**
 * Snapshot metrics, save activity log, and fire-and-forget memory extraction
 * for a completed unit. Returns the activity log file path (if any).
 */
export async function closeoutUnit(ctx, basePath, unitType, unitId, startedAt, opts) {
    const modelId = ctx.model?.id ?? "unknown";
    snapshotUnitMetrics(ctx, unitType, unitId, startedAt, modelId, opts);
    const activityFile = saveActivityLog(ctx, basePath, unitType, unitId);
    if (activityFile) {
        try {
            const { buildMemoryLLMCall, extractMemoriesFromUnit } = await import('./memory-extractor.js');
            const llmCallFn = buildMemoryLLMCall(ctx);
            if (llmCallFn) {
                extractMemoriesFromUnit(activityFile, unitType, unitId, llmCallFn).catch((err) => {
                    if (process.env.GSD_DEBUG)
                        console.error(`[gsd] memory extraction failed for ${unitType}/${unitId}:`, err);
                });
            }
        }
        catch { /* non-fatal */ }
    }
    return activityFile ?? undefined;
}
