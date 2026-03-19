export function registerExitCommand(pi, deps = {}) {
    pi.registerCommand("exit", {
        description: "Exit GSD gracefully",
        handler: async (_args, ctx) => {
            // Stop auto-mode first so locks and activity state are cleaned up before shutdown.
            const stopAuto = deps.stopAuto ?? (await import("./auto.js")).stopAuto;
            await stopAuto(ctx, pi, "Graceful exit");
            ctx.shutdown();
        },
    });
}
