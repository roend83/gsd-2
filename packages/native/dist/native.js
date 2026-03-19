/**
 * Native addon loader.
 *
 * Locates and loads the compiled Rust N-API addon (`.node` file).
 * Resolution order:
 *   1. @gsd-build/engine-{platform} npm optional dependency (production install)
 *   2. native/addon/gsd_engine.{platform}.node (local release build)
 *   3. native/addon/gsd_engine.dev.node (local debug build)
 */
import { createRequire } from "node:module";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const addonDir = path.resolve(__dirname, "..", "..", "..", "native", "addon");
const platformTag = `${process.platform}-${process.arch}`;
/** Map Node.js platform/arch to the npm package suffix */
const platformPackageMap = {
    "darwin-arm64": "darwin-arm64",
    "darwin-x64": "darwin-x64",
    "linux-x64": "linux-x64-gnu",
    "linux-arm64": "linux-arm64-gnu",
    "win32-x64": "win32-x64-msvc",
};
let _loadedSuccessfully = false;
function loadNative() {
    const errors = [];
    // 1. Try the platform-specific npm optional dependency
    const packageSuffix = platformPackageMap[platformTag];
    if (packageSuffix) {
        try {
            _loadedSuccessfully = true;
            return require(`@gsd-build/engine-${packageSuffix}`);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            errors.push(`@gsd-build/engine-${packageSuffix}: ${message}`);
        }
    }
    // 2. Try local release build (native/addon/gsd_engine.{platform}.node)
    const releasePath = path.join(addonDir, `gsd_engine.${platformTag}.node`);
    try {
        _loadedSuccessfully = true;
        return require(releasePath);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${releasePath}: ${message}`);
    }
    // 3. Try local dev build (native/addon/gsd_engine.dev.node)
    const devPath = path.join(addonDir, "gsd_engine.dev.node");
    try {
        _loadedSuccessfully = true;
        return require(devPath);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${devPath}: ${message}`);
    }
    const details = errors.map((e) => `  - ${e}`).join("\n");
    const supportedPlatforms = Object.keys(platformPackageMap);
    // Graceful fallback: on unsupported platforms (e.g., win32-arm64), return a
    // proxy that throws on individual function calls rather than crashing the
    // entire import chain at startup (#1223). Consumers with JS fallbacks
    // (parseRoadmap, parsePlan, fuzzyFind, etc.) catch these and degrade gracefully.
    process.stderr.write(`[gsd] Native addon not available for ${platformTag}. Falling back to JS implementations (slower).\n` +
        `  Supported native platforms: ${supportedPlatforms.join(", ")}\n`);
    return new Proxy({}, {
        get(_target, prop) {
            return (..._args) => {
                throw new Error(`Native function '${String(prop)}' is not available on ${platformTag}`);
            };
        },
    });
}
export const native = loadNative();
/** True when the native addon loaded successfully. False on unsupported platforms. */
export const nativeAvailable = _loadedSuccessfully;
