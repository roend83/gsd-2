import { type ImageDimensions } from "../terminal-image.js";
import type { Component } from "../tui.js";
export interface ImageTheme {
    fallbackColor: (str: string) => string;
}
export interface ImageOptions {
    maxWidthCells?: number;
    maxHeightCells?: number;
    filename?: string;
    /** Kitty image ID. If provided, reuses this ID (for animations/updates). */
    imageId?: number;
}
export declare class Image implements Component {
    private base64Data;
    private mimeType;
    private dimensions;
    private theme;
    private options;
    private imageId?;
    private dimensionsResolved;
    private onDimensionsResolved?;
    private cachedLines?;
    private cachedWidth?;
    constructor(base64Data: string, mimeType: string, theme: ImageTheme, options?: ImageOptions, dimensions?: ImageDimensions);
    /**
     * Register a callback invoked when async dimension parsing completes.
     * Useful for triggering a re-render after the Image updates its layout.
     */
    setOnDimensionsResolved(cb: () => void): void;
    /** Get the Kitty image ID used by this image (if any). */
    getImageId(): number | undefined;
    invalidate(): void;
    render(width: number): string[];
}
//# sourceMappingURL=image.d.ts.map