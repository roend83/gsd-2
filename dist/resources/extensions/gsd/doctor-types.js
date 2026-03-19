/**
 * Issue codes that represent expected completion-transition states.
 * These are detected by the doctor but should NOT be auto-fixed at task level —
 * they are resolved by the complete-slice/complete-milestone dispatch units.
 * Consumers (e.g. auto-post-unit health tracking) should exclude these from
 * error counts when running at task fixLevel to avoid false escalation.
 */
export const COMPLETION_TRANSITION_CODES = new Set([
    "all_tasks_done_missing_slice_summary",
    "all_tasks_done_missing_slice_uat",
    "all_tasks_done_roadmap_not_checked",
]);
