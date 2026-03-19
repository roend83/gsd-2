/**
 * Native image processing module using N-API.
 *
 * High-performance image decode/encode/resize backed by the Rust `image` crate.
 */
import type { NativeImageHandle } from "./types.js";
import { ImageFormat, SamplingFilter } from "./types.js";
export { ImageFormat, SamplingFilter };
export type { NativeImageHandle };
/**
 * Decode image bytes (PNG, JPEG, WebP, GIF) into a NativeImage handle.
 *
 * Format is auto-detected from the byte content.
 */
export declare function parseImage(bytes: Uint8Array): Promise<NativeImageHandle>;
