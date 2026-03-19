/**
 * bash-background.test.ts — Tests for rewriteBackgroundCommand
 *
 * Regression for #733: `cmd &` causes the bash tool to hang indefinitely
 * because the background process inherits the piped stdout/stderr and keeps
 * them open. rewriteBackgroundCommand injects >/dev/null 2>&1 before & when
 * the command does not already redirect stdout.
 */
export {};
//# sourceMappingURL=bash-background.test.d.ts.map