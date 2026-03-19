// GSD Extension — Desktop Notification Helper
// Cross-platform desktop notifications for auto-mode events.
import { execFileSync } from "node:child_process";
import { loadEffectiveGSDPreferences } from "./preferences.js";
/**
 * Send a native desktop notification. Non-blocking, non-fatal.
 * macOS: osascript, Linux: notify-send, Windows: skipped.
 */
export function sendDesktopNotification(title, message, level = "info", kind = "complete") {
    if (!shouldSendDesktopNotification(kind))
        return;
    try {
        const command = buildDesktopNotificationCommand(process.platform, title, message, level);
        if (!command)
            return;
        execFileSync(command.file, command.args, { timeout: 3000, stdio: "ignore" });
    }
    catch {
        // Non-fatal — desktop notifications are best-effort
    }
}
export function shouldSendDesktopNotification(kind, preferences = loadEffectiveGSDPreferences()?.preferences.notifications) {
    if (preferences?.enabled === false)
        return false;
    switch (kind) {
        case "error":
            return preferences?.on_error ?? true;
        case "budget":
            return preferences?.on_budget ?? true;
        case "milestone":
            return preferences?.on_milestone ?? true;
        case "attention":
            return preferences?.on_attention ?? true;
        case "complete":
        default:
            return preferences?.on_complete ?? true;
    }
}
export function buildDesktopNotificationCommand(platform, title, message, level = "info") {
    const normalizedTitle = normalizeNotificationText(title);
    const normalizedMessage = normalizeNotificationText(message);
    if (platform === "darwin") {
        const sound = level === "error" ? 'sound name "Basso"' : 'sound name "Glass"';
        const script = `display notification "${escapeAppleScript(normalizedMessage)}" with title "${escapeAppleScript(normalizedTitle)}" ${sound}`;
        return { file: "osascript", args: ["-e", script] };
    }
    if (platform === "linux") {
        const urgency = level === "error" ? "critical" : level === "warning" ? "normal" : "low";
        return { file: "notify-send", args: ["-u", urgency, normalizedTitle, normalizedMessage] };
    }
    return null;
}
function normalizeNotificationText(s) {
    return s.replace(/\r?\n/g, " ").trim();
}
function escapeAppleScript(s) {
    return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
