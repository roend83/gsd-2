/**
 * Type definitions, constants, and configuration shapes for GSD preferences.
 *
 * All interfaces, type aliases, and static lookup tables live here so that
 * both the validation and runtime modules can import them without pulling
 * in filesystem or loading logic.
 */
/** Default preference values for each workflow mode. */
export const MODE_DEFAULTS = {
    solo: {
        git: {
            auto_push: true,
            push_branches: false,
            pre_merge_check: false,
            merge_strategy: "squash",
            isolation: "worktree",
        },
        unique_milestone_ids: false,
    },
    team: {
        git: {
            auto_push: false,
            push_branches: true,
            pre_merge_check: true,
            merge_strategy: "squash",
            isolation: "worktree",
        },
        unique_milestone_ids: true,
    },
};
/** All recognized top-level keys in GSDPreferences. Used to detect typos / stale config. */
export const KNOWN_PREFERENCE_KEYS = new Set([
    "version",
    "mode",
    "always_use_skills",
    "prefer_skills",
    "avoid_skills",
    "skill_rules",
    "custom_instructions",
    "models",
    "skill_discovery",
    "skill_staleness_days",
    "auto_supervisor",
    "uat_dispatch",
    "unique_milestone_ids",
    "budget_ceiling",
    "budget_enforcement",
    "context_pause_threshold",
    "notifications",
    "remote_questions",
    "git",
    "post_unit_hooks",
    "pre_dispatch_hooks",
    "dynamic_routing",
    "token_profile",
    "phases",
    "auto_visualize",
    "auto_report",
    "parallel",
    "verification_commands",
    "verification_auto_fix",
    "verification_max_retries",
    "search_provider",
    "compression_strategy",
    "context_selection",
]);
/** Canonical list of all dispatch unit types. */
export const KNOWN_UNIT_TYPES = [
    "research-milestone", "plan-milestone", "research-slice", "plan-slice",
    "execute-task", "complete-slice", "replan-slice", "reassess-roadmap",
    "run-uat", "complete-milestone",
];
export const SKILL_ACTIONS = new Set(["use", "prefer", "avoid"]);
