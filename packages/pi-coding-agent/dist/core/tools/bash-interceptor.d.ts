/**
 * Bash command interceptor — blocks shell commands that duplicate dedicated tools.
 *
 * Each rule defines a regex pattern, a suggested replacement tool, and a message.
 * A command is only blocked when the suggested tool exists in the session's active tool list.
 */
export interface BashInterceptorRule {
    pattern: string;
    flags?: string;
    tool: string;
    message: string;
}
export declare const DEFAULT_BASH_INTERCEPTOR_RULES: BashInterceptorRule[];
export interface InterceptionResult {
    block: boolean;
    message?: string;
    suggestedTool?: string;
}
export interface CompiledInterceptor {
    check: (command: string, availableTools: string[]) => InterceptionResult;
}
/**
 * Compile rules into an interceptor with pre-built regex objects.
 * Silently skips rules with invalid patterns.
 *
 * Pre-compiling at construction time avoids repeated `new RegExp()` calls
 * on every bash command invocation.
 */
export declare function compileInterceptor(rules: BashInterceptorRule[]): CompiledInterceptor;
/**
 * Check whether a bash command should be intercepted.
 *
 * Compiles rules on each call — prefer `compileInterceptor()` for repeated use.
 *
 * @param command - The shell command to check
 * @param availableTools - Tool names present in the current session
 * @param rules - Override the default rule set (optional)
 */
export declare function checkBashInterception(command: string, availableTools: string[], rules?: BashInterceptorRule[]): InterceptionResult;
//# sourceMappingURL=bash-interceptor.d.ts.map