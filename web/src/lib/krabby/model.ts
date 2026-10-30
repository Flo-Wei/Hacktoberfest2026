import {
  ApiError,
  GoogleGenAI,
  type Content,
  type FunctionCall,
  type GenerateContentConfig,
  type Part,
} from "@google/genai";

// Gemma 4 is a project requirement, so there is no fallback to another model.
const MODEL = "gemma-4-26b-a4b-it";
const ATTEMPTS = 5;
// Calls either start within seconds or stall for 30s or more, so give up on a
// silent one early. The last attempt gets the full time.
const FIRST_CHUNK_TIMEOUT_MS = 10_000;
const STREAM_TIMEOUT_MS = 30_000;
const TEXT_TIMEOUT_MS = 25_000;
const BACKOFF_MS = 400;
const MAX_RATE_LIMIT_WAIT_MS = 40_000;

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The hosted model often returns temporary 500s. Real client errors won't pass on a retry.
function isTemporary(error: unknown) {
  if (error instanceof ApiError) return error.status >= 500 || error.status === 429;
  return true;
}

const isRateLimit = (error: unknown) => error instanceof ApiError && error.status === 429;

// The free tier allows 16,000 input tokens a minute. Retrying sooner than the
// API asks only fails again.
function delayMs(error: unknown, attempt: number) {
  if (!isRateLimit(error)) return BACKOFF_MS * 2 ** attempt;
  const seconds = /retry in ([\d.]+)s/.exec(String((error as ApiError).message))?.[1];
  return Math.min((Number(seconds) || 20) * 1000 + 500, MAX_RATE_LIMIT_WAIT_MS);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ModelReply = { content: Content; calls: FunctionCall[] };

// Calls onRetry after a failed attempt, so anything already shown can be cleared.
export async function streamReply(
  contents: Content[],
  config: GenerateContentConfig,
  onText: (delta: string) => void,
  onRetry: (rateLimited: boolean) => void,
): Promise<ModelReply> {
  for (let attempt = 0; ; attempt++) {
    const stalled = new AbortController();
    const lastAttempt = attempt === ATTEMPTS - 1;
    const firstChunk = lastAttempt ? undefined : setTimeout(() => stalled.abort(), FIRST_CHUNK_TIMEOUT_MS);
    try {
      const stream = await client.models.generateContentStream({
        model: MODEL,
        contents,
        config: {
          ...config,
          abortSignal: AbortSignal.any([stalled.signal, AbortSignal.timeout(STREAM_TIMEOUT_MS)]),
        },
      });

      const parts: Part[] = [];
      const calls: FunctionCall[] = [];
      for await (const chunk of stream) {
        clearTimeout(firstChunk);
        for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
          parts.push(part);
          if (part.functionCall) calls.push(part.functionCall);
          else if (part.text && !part.thought) onText(part.text);
        }
      }
      return { content: { role: "model", parts }, calls };
    } catch (error) {
      clearTimeout(firstChunk);
      if (!isTemporary(error) || lastAttempt) throw error;
      console.warn(`Model call failed, retrying (${attempt + 1}/${ATTEMPTS}): ${error}`);
      onRetry(isRateLimit(error));
      await wait(delayMs(error, attempt));
    }
  }
}

export async function generateText(contents: Content[], config: GenerateContentConfig) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: MODEL,
        contents,
        config: { ...config, abortSignal: AbortSignal.timeout(TEXT_TIMEOUT_MS) },
      });
      return response.text?.trim() ?? "";
    } catch (error) {
      // Only comments use this, and they aren't worth waiting out a rate limit for.
      if (isRateLimit(error) || !isTemporary(error) || attempt === ATTEMPTS - 1) throw error;
      await wait(delayMs(error, attempt));
    }
  }
}
