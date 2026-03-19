/**
 * Atomically write a file by writing to a temporary path then renaming.
 * This prevents data loss if the process crashes mid-write — either the
 * old file remains intact or the new content is fully written.
 */
export declare function atomicWriteFileSync(filePath: string, content: string | Buffer, encoding?: BufferEncoding): void;
//# sourceMappingURL=fs-utils.d.ts.map