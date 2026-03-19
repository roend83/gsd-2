/**
 * Native image processing module using N-API.
 *
 * High-performance image decode/encode/resize backed by the Rust `image` crate.
 */
import { native } from "../native.js";
import { ImageFormat, SamplingFilter } from "./types.js";
export { ImageFormat, SamplingFilter };
const NativeImageClass = native
    .NativeImage;
/**
 * Decode image bytes (PNG, JPEG, WebP, GIF) into a NativeImage handle.
 *
 * Format is auto-detected from the byte content.
 */
export function parseImage(bytes) {
    return NativeImageClass.parse(bytes);
}
