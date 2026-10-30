import OpenAI from "openai";
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolChoiceOption,
} from "openai/resources/chat/completions";

// Gemma 4 is a project requirement.
const MODEL = "google/gemma-4-26b-a4b-it";
// DeepInfra is fast and honours tool_choice, which some providers ignore. It can't
// read images, so OpenRouter sends photo turns to another provider that supports them.
const PROVIDER = { order: ["deepinfra"], allow_fallbacks: true, require_parameters: true };
const ATTEMPTS = 3;
const REPLY_TIMEOUT_MS = 30_000;
const COMMENT_TIMEOUT_MS = 15_000;

export type ToolCall = { id: string; name: string; args: Record<string, unknown> };

export type ModelReply = { message: ChatCompletionAssistantMessageParam; calls: ToolCall[] };

export type ReplyEvent = { type: "text"; delta: string } | { type: "retry" };

// Created on first use, because the SDK throws without a key and builds have none.
let client: OpenAI | null = null;

function getClient() {
  client ??= new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });
  return client;
}

function parseArgs(json: string) {
  try {
    return JSON.parse(json || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function* attemptReply(
  messages: ChatCompletionMessageParam[],
  tools: ChatCompletionTool[],
  toolChoice: ChatCompletionToolChoiceOption,
): AsyncGenerator<ReplyEvent, ModelReply> {
  const stream = await getClient().chat.completions.create(
    {
      model: MODEL,
      messages,
      tools,
      tool_choice: toolChoice,
      stream: true,
      provider: PROVIDER,
    } as ChatCompletionCreateParamsStreaming,
    { timeout: REPLY_TIMEOUT_MS, maxRetries: 1 },
  );

  let text = "";
  const pending: { id: string; name: string; args: string }[] = [];
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta;
    if (delta?.content) {
      text += delta.content;
      yield { type: "text", delta: delta.content };
    }
    for (const call of delta?.tool_calls ?? []) {
      pending[call.index] ??= { id: "", name: "", args: "" };
      pending[call.index].id ||= call.id ?? "";
      pending[call.index].name ||= call.function?.name ?? "";
      pending[call.index].args += call.function?.arguments ?? "";
    }
  }

  const calls = pending.filter(Boolean);
  return {
    calls: calls.map(({ id, name, args }) => ({ id, name, args: parseArgs(args) })),
    message: {
      role: "assistant",
      content: text || null,
      ...(calls.length > 0 && {
        tool_calls: calls.map(({ id, name, args }) => ({
          id,
          type: "function" as const,
          function: { name, arguments: args || "{}" },
        })),
      }),
    },
  };
}

// A stream can fail halfway, so a retry tells the caller to drop the text so far.
export async function* streamReply(
  messages: ChatCompletionMessageParam[],
  tools: ChatCompletionTool[],
  toolChoice: ChatCompletionToolChoiceOption,
): AsyncGenerator<ReplyEvent, ModelReply> {
  for (let attempt = 1; ; attempt++) {
    try {
      return yield* attemptReply(messages, tools, toolChoice);
    } catch (error) {
      if (attempt === ATTEMPTS) throw error;
      console.warn(`Model call failed, retrying (${attempt}/${ATTEMPTS}): ${error}`);
      yield { type: "retry" };
    }
  }
}

export async function generateText(system: string, prompt: string) {
  const response = await getClient().chat.completions.create(
    {
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      provider: PROVIDER,
    } as ChatCompletionCreateParamsNonStreaming,
    { timeout: COMMENT_TIMEOUT_MS, maxRetries: 1 },
  );
  return response.choices[0]?.message?.content?.trim() ?? "";
}
