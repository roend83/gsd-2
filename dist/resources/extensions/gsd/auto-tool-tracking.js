/**
 * In-flight tool call tracking for auto-mode idle detection.
 * Tracks which tool calls are currently executing so the idle watchdog
 * can distinguish "waiting for tool completion" from "truly idle".
 */
const inFlightTools = new Map();
/**
 * Mark a tool execution as in-flight.
 * Records start time so the idle watchdog can detect tools hung longer than the idle timeout.
 */
export function markToolStart(toolCallId, isActive) {
    if (!isActive)
        return;
    inFlightTools.set(toolCallId, Date.now());
}
/**
 * Mark a tool execution as completed.
 */
export function markToolEnd(toolCallId) {
    inFlightTools.delete(toolCallId);
}
/**
 * Returns the age (ms) of the oldest currently in-flight tool, or 0 if none.
 */
export function getOldestInFlightToolAgeMs() {
    if (inFlightTools.size === 0)
        return 0;
    const oldestStart = Math.min(...inFlightTools.values());
    return Date.now() - oldestStart;
}
/**
 * Returns the number of currently in-flight tools.
 */
export function getInFlightToolCount() {
    return inFlightTools.size;
}
/**
 * Returns the start timestamp of the oldest in-flight tool, or undefined if none.
 */
export function getOldestInFlightToolStart() {
    if (inFlightTools.size === 0)
        return undefined;
    return Math.min(...inFlightTools.values());
}
/**
 * Clear all in-flight tool tracking state.
 */
export function clearInFlightTools() {
    inFlightTools.clear();
}
