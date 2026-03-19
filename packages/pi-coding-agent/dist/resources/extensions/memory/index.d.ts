/**
 * Memory extraction extension.
 *
 * Automated two-phase pipeline that extracts durable knowledge from session
 * transcripts and consolidates into project-scoped memory artifacts injected
 * into future sessions.
 *
 * Lifecycle:
 * - session_start (depth 0): fire-and-forget pipeline.runStartup()
 * - before_agent_start: inject memory_summary.md into system prompt
 * - /memory command: view, clear, rebuild, stats
 */
import type { ExtensionAPI } from "@gsd/pi-coding-agent";
export default function memoryExtension(api: ExtensionAPI): void;
//# sourceMappingURL=index.d.ts.map