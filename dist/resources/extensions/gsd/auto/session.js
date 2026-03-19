/**
 * AutoSession — encapsulates all mutable auto-mode state into a single instance.
 *
 * Replaces ~40 module-level variables scattered across auto.ts with typed
 * properties on a class instance. Benefits:
 *
 * - reset() clears everything in one call (was 25+ manual resets in stopAuto)
 * - toJSON() provides diagnostic snapshots
 * - grep `s.` shows every state access
 * - Constructable for testing
 *
 * MAINTENANCE RULE: All new mutable auto-mode state MUST be added here as a
 * class property, not as a module-level variable in auto.ts. If the state
 * needs clearing on stop, add it to reset(). Tests in
 * auto-session-encapsulation.test.ts enforce that auto.ts has no module-level
 * `let` or `var` declarations.
 */
// ─── Constants ───────────────────────────────────────────────────────────────
export const MAX_UNIT_DISPATCHES = 3;
export const STUB_RECOVERY_THRESHOLD = 2;
export const MAX_LIFETIME_DISPATCHES = 6;
export const MAX_CONSECUTIVE_SKIPS = 3;
export const DISPATCH_GAP_TIMEOUT_MS = 5_000;
export const MAX_SKIP_DEPTH = 20;
export const NEW_SESSION_TIMEOUT_MS = 30_000;
export const DISPATCH_HANG_TIMEOUT_MS = 60_000;
// ─── AutoSession ─────────────────────────────────────────────────────────────
export class AutoSession {
    // ── Lifecycle ────────────────────────────────────────────────────────────
    active = false;
    paused = false;
    pausedForSecrets = false;
    stepMode = false;
    verbose = false;
    cmdCtx = null;
    // ── Paths ────────────────────────────────────────────────────────────────
    basePath = "";
    originalBasePath = "";
    gitService = null;
    // ── Dispatch counters ────────────────────────────────────────────────────
    unitDispatchCount = new Map();
    unitLifetimeDispatches = new Map();
    unitRecoveryCount = new Map();
    unitConsecutiveSkips = new Map();
    completedKeySet = new Set();
    // ── Timers ───────────────────────────────────────────────────────────────
    unitTimeoutHandle = null;
    wrapupWarningHandle = null;
    idleWatchdogHandle = null;
    continueHereHandle = null;
    dispatchGapHandle = null;
    // ── Current unit ─────────────────────────────────────────────────────────
    currentUnit = null;
    currentUnitRouting = null;
    completedUnits = [];
    currentMilestoneId = null;
    // ── Model state ──────────────────────────────────────────────────────────
    autoModeStartModel = null;
    originalModelId = null;
    originalModelProvider = null;
    lastBudgetAlertLevel = 0;
    // ── Recovery ─────────────────────────────────────────────────────────────
    pendingCrashRecovery = null;
    pendingVerificationRetry = null;
    verificationRetryCount = new Map();
    pausedSessionFile = null;
    resourceVersionOnStart = null;
    lastStateRebuildAt = 0;
    // ── Guards ───────────────────────────────────────────────────────────────
    handlingAgentEnd = false;
    pendingAgentEndRetry = false;
    dispatching = false;
    skipDepth = 0;
    recentlyEvictedKeys = new Set();
    // ── Metrics ──────────────────────────────────────────────────────────────
    autoStartTime = 0;
    lastPromptCharCount;
    lastBaselineCharCount;
    pendingQuickTasks = [];
    // ── Signal handler ───────────────────────────────────────────────────────
    sigtermHandler = null;
    // ── Methods ──────────────────────────────────────────────────────────────
    clearTimers() {
        if (this.unitTimeoutHandle) {
            clearTimeout(this.unitTimeoutHandle);
            this.unitTimeoutHandle = null;
        }
        if (this.wrapupWarningHandle) {
            clearTimeout(this.wrapupWarningHandle);
            this.wrapupWarningHandle = null;
        }
        if (this.idleWatchdogHandle) {
            clearInterval(this.idleWatchdogHandle);
            this.idleWatchdogHandle = null;
        }
        if (this.continueHereHandle) {
            clearInterval(this.continueHereHandle);
            this.continueHereHandle = null;
        }
        if (this.dispatchGapHandle) {
            clearTimeout(this.dispatchGapHandle);
            this.dispatchGapHandle = null;
        }
    }
    resetDispatchCounters() {
        this.unitDispatchCount.clear();
        this.unitLifetimeDispatches.clear();
        this.unitConsecutiveSkips.clear();
    }
    get lockBasePath() {
        return this.originalBasePath || this.basePath;
    }
    completeCurrentUnit() {
        if (!this.currentUnit)
            return null;
        const done = { ...this.currentUnit, finishedAt: Date.now() };
        this.completedUnits.push(done);
        this.currentUnit = null;
        return done;
    }
    reset() {
        this.clearTimers();
        // Lifecycle
        this.active = false;
        this.paused = false;
        this.pausedForSecrets = false;
        this.stepMode = false;
        this.verbose = false;
        this.cmdCtx = null;
        // Paths
        this.basePath = "";
        this.originalBasePath = "";
        this.gitService = null;
        // Dispatch
        this.unitDispatchCount.clear();
        this.unitLifetimeDispatches.clear();
        this.unitRecoveryCount.clear();
        this.unitConsecutiveSkips.clear();
        // Note: completedKeySet is intentionally NOT cleared — it persists
        // across restarts to prevent re-dispatching completed units.
        // Unit
        this.currentUnit = null;
        this.currentUnitRouting = null;
        this.completedUnits = [];
        this.currentMilestoneId = null;
        // Model
        this.autoModeStartModel = null;
        this.originalModelId = null;
        this.originalModelProvider = null;
        this.lastBudgetAlertLevel = 0;
        // Recovery
        this.pendingCrashRecovery = null;
        this.pendingVerificationRetry = null;
        this.verificationRetryCount.clear();
        this.pausedSessionFile = null;
        this.resourceVersionOnStart = null;
        this.lastStateRebuildAt = 0;
        // Guards
        this.handlingAgentEnd = false;
        this.pendingAgentEndRetry = false;
        this.dispatching = false;
        this.skipDepth = 0;
        this.recentlyEvictedKeys.clear();
        // Metrics
        this.autoStartTime = 0;
        this.lastPromptCharCount = undefined;
        this.lastBaselineCharCount = undefined;
        this.pendingQuickTasks = [];
        // Signal handler
        this.sigtermHandler = null;
    }
    toJSON() {
        return {
            active: this.active,
            paused: this.paused,
            stepMode: this.stepMode,
            basePath: this.basePath,
            currentMilestoneId: this.currentMilestoneId,
            currentUnit: this.currentUnit,
            completedUnits: this.completedUnits.length,
            completedKeySet: this.completedKeySet.size,
            unitDispatchCount: Object.fromEntries(this.unitDispatchCount),
            dispatching: this.dispatching,
            skipDepth: this.skipDepth,
        };
    }
}
