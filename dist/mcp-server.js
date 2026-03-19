// MCP SDK subpath imports use wildcard exports (./*) that NodeNext resolves
// at runtime but TypeScript cannot statically type-check. We construct the
// specifiers dynamically so tsc treats them as `any`.
const MCP_PKG = '@modelcontextprotocol/sdk';
/**
 * Starts a native MCP (Model Context Protocol) server over stdin/stdout.
 *
 * This enables GSD's tools (read, write, edit, bash, grep, glob, ls, etc.)
 * to be used by external AI clients such as Claude Desktop, VS Code Copilot,
 * and any MCP-compatible host.
 *
 * The server registers all tools from the agent session's tool registry and
 * maps MCP tools/list and tools/call requests to GSD tool definitions and
 * execution, respectively.
 *
 * All MCP SDK imports are dynamic to avoid subpath export resolution issues
 * with TypeScript's NodeNext module resolution.
 */
export async function startMcpServer(options) {
    const { tools, version = '0.0.0' } = options;
    const serverMod = await import(`${MCP_PKG}/server`);
    const stdioMod = await import(`${MCP_PKG}/server/stdio`);
    const typesMod = await import(`${MCP_PKG}/types`);
    const Server = serverMod.Server;
    const StdioServerTransport = stdioMod.StdioServerTransport;
    const { ListToolsRequestSchema, CallToolRequestSchema } = typesMod;
    // Build a lookup map for fast tool resolution on calls
    const toolMap = new Map();
    for (const tool of tools) {
        toolMap.set(tool.name, tool);
    }
    const server = new Server({ name: 'gsd', version }, { capabilities: { tools: {} } });
    // tools/list — return every registered GSD tool with its JSON Schema parameters
    server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: tools.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.parameters,
        })),
    }));
    // tools/call — execute the requested tool and return content blocks
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const tool = toolMap.get(name);
        if (!tool) {
            return {
                isError: true,
                content: [{ type: 'text', text: `Unknown tool: ${name}` }],
            };
        }
        try {
            const result = await tool.execute(`mcp-${Date.now()}`, args ?? {}, undefined, // no AbortSignal
            undefined);
            // Convert AgentToolResult content blocks to MCP content format
            const content = result.content.map((block) => {
                if (block.type === 'text')
                    return { type: 'text', text: block.text ?? '' };
                if (block.type === 'image')
                    return { type: 'image', data: block.data ?? '', mimeType: block.mimeType ?? 'image/png' };
                return { type: 'text', text: JSON.stringify(block) };
            });
            return { content };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return { isError: true, content: [{ type: 'text', text: message }] };
        }
    });
    // Connect to stdin/stdout transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    process.stderr.write(`[gsd] MCP server started (v${version})\n`);
}
