import type { AstFindOptions, AstFindResult, AstReplaceOptions, AstReplaceResult, AstFindMatch, AstReplaceChange, AstReplaceFileChange } from "./types.js";
export type { AstFindMatch, AstFindOptions, AstFindResult, AstReplaceChange, AstReplaceFileChange, AstReplaceOptions, AstReplaceResult };
export declare function astGrep(options: AstFindOptions): AstFindResult;
export declare function astEdit(options: AstReplaceOptions): AstReplaceResult;
