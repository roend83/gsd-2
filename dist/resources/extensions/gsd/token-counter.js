const CHARS_PER_TOKEN_BY_PROVIDER = {
    anthropic: 3.5,
    openai: 4.0,
    google: 4.0,
    mistral: 3.8,
    bedrock: 3.5,
    unknown: 4.0,
};
let encoder = null;
let encoderFailed = false;
async function getEncoder() {
    if (encoder)
        return encoder;
    if (encoderFailed)
        return null;
    try {
        // @ts-ignore — tiktoken may not have type declarations in extensions tsconfig
        const tiktoken = await import("tiktoken");
        encoder = tiktoken.encoding_for_model("gpt-4o");
        return encoder;
    }
    catch {
        encoderFailed = true;
        return null;
    }
}
export async function countTokens(text) {
    const enc = await getEncoder();
    if (enc) {
        const tokens = enc.encode(text);
        return tokens.length;
    }
    return Math.ceil(text.length / 4);
}
export function countTokensSync(text) {
    if (encoder) {
        return encoder.encode(text).length;
    }
    return Math.ceil(text.length / 4);
}
export async function initTokenCounter() {
    const enc = await getEncoder();
    return enc !== null;
}
export function isAccurateCountingAvailable() {
    return encoder !== null;
}
export function getCharsPerToken(provider) {
    return CHARS_PER_TOKEN_BY_PROVIDER[provider] ?? CHARS_PER_TOKEN_BY_PROVIDER.unknown;
}
export function estimateTokensForProvider(text, provider) {
    const ratio = getCharsPerToken(provider);
    return Math.ceil(text.length / ratio);
}
