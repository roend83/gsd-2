import { Type } from "@sinclair/typebox";
function StringEnum(values, options) {
    return Type.Unsafe({
        type: "string",
        enum: values,
        ...(options?.description && { description: options.description }),
        ...(options?.default && { default: options.default }),
    });
}
// =============================================================================
// Tool Schema
// =============================================================================
export const lspSchema = Type.Object({
    action: StringEnum([
        "diagnostics",
        "definition",
        "references",
        "hover",
        "symbols",
        "rename",
        "code_actions",
        "type_definition",
        "implementation",
        "incoming_calls",
        "outgoing_calls",
        "format",
        "signature",
        "status",
        "reload",
    ], { description: "LSP operation" }),
    file: Type.Optional(Type.String({ description: "File path" })),
    line: Type.Optional(Type.Number({ description: "Line number (1-indexed)" })),
    symbol: Type.Optional(Type.String({ description: "Symbol/substring to locate on the line (used to compute column)" })),
    occurrence: Type.Optional(Type.Number({ description: "Symbol occurrence on line (1-indexed, default: 1)" })),
    query: Type.Optional(Type.String({ description: "Search query or SSR pattern" })),
    new_name: Type.Optional(Type.String({ description: "New name for rename" })),
    apply: Type.Optional(Type.Boolean({ description: "Apply edits (default: true)" })),
    tab_size: Type.Optional(Type.Number({ description: "Tab size for formatting (default: 4)" })),
    insert_spaces: Type.Optional(Type.Boolean({ description: "Use spaces for formatting (default: true)" })),
    timeout: Type.Optional(Type.Number({ description: "Request timeout in seconds" })),
});
export const SYMBOL_KIND_NAMES = {
    1: "File",
    2: "Module",
    3: "Namespace",
    4: "Package",
    5: "Class",
    6: "Method",
    7: "Property",
    8: "Field",
    9: "Constructor",
    10: "Enum",
    11: "Interface",
    12: "Function",
    13: "Variable",
    14: "Constant",
    15: "String",
    16: "Number",
    17: "Boolean",
    18: "Array",
    19: "Object",
    20: "Key",
    21: "Null",
    22: "EnumMember",
    23: "Struct",
    24: "Event",
    25: "Operator",
    26: "TypeParameter",
};
//# sourceMappingURL=types.js.map