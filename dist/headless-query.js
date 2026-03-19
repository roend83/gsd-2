/**
 * Headless Query — `gsd headless query`
 *
 * Single read-only command that returns the full project snapshot as JSON
 * to stdout, without spawning an LLM session. Instant (~50ms).
 *
 * Output: { state, next, cost }
 *   state — deriveState() output (phase, milestones, progress, blockers)
 *   next  — dry-run dispatch preview (what auto-mode would do next)
 *   cost  — aggregated parallel worker costs
 *
 * Note: Extension modules are .ts files loaded via jiti (not compiled to .js).
 * We use createJiti() here because this module is imported directly from cli.ts,
 * bypassing the extension loader's jiti setup (#1137).
 */
import { createJiti } from '@mariozechner/jiti';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const jiti = createJiti(fileURLToPath(import.meta.url), { interopDefault: true, debug: false });
async function loadExtensionModules() {
    const stateModule = await jiti.import(join(__dirname, 'resources/extensions/gsd/state.ts'), {});
    const dispatchModule = await jiti.import(join(__dirname, 'resources/extensions/gsd/auto-dispatch.ts'), {});
    const sessionModule = await jiti.import(join(__dirname, 'resources/extensions/gsd/session-status-io.ts'), {});
    const prefsModule = await jiti.import(join(__dirname, 'resources/extensions/gsd/preferences.ts'), {});
    return {
        deriveState: stateModule.deriveState,
        resolveDispatch: dispatchModule.resolveDispatch,
        readAllSessionStatuses: sessionModule.readAllSessionStatuses,
        loadEffectiveGSDPreferences: prefsModule.loadEffectiveGSDPreferences,
    };
}
// ─── Implementation ─────────────────────────────────────────────────────────
export async function handleQuery(basePath) {
    const { deriveState, resolveDispatch, readAllSessionStatuses, loadEffectiveGSDPreferences } = await loadExtensionModules();
    const state = await deriveState(basePath);
    // Derive next dispatch action
    let next;
    if (!state.activeMilestone) {
        next = {
            action: 'stop',
            reason: state.phase === 'complete' ? 'All milestones complete.' : state.nextAction,
        };
    }
    else {
        const loaded = loadEffectiveGSDPreferences();
        const dispatch = await resolveDispatch({
            basePath,
            mid: state.activeMilestone.id,
            midTitle: state.activeMilestone.title,
            state,
            prefs: loaded?.preferences,
        });
        next = {
            action: dispatch.action,
            unitType: dispatch.action === 'dispatch' ? dispatch.unitType : undefined,
            unitId: dispatch.action === 'dispatch' ? dispatch.unitId : undefined,
            reason: dispatch.action === 'stop' ? dispatch.reason : undefined,
        };
    }
    // Aggregate parallel worker costs
    const statuses = readAllSessionStatuses(basePath);
    const workers = statuses.map((s) => ({
        milestoneId: s.milestoneId,
        pid: s.pid,
        state: s.state,
        cost: s.cost,
        lastHeartbeat: s.lastHeartbeat,
    }));
    const snapshot = {
        state,
        next,
        cost: { workers, total: workers.reduce((sum, w) => sum + w.cost, 0) },
    };
    process.stdout.write(JSON.stringify(snapshot) + '\n');
    return { exitCode: 0, data: snapshot };
}
