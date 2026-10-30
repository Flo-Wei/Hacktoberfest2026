import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
import { addMessage, recentMessages, type ChatMessage } from "@/lib/chats";
import type { Meal } from "@/lib/meals";
import type { User } from "@/lib/users";
import { streamReply, type ModelReply } from "./model";
import { chatPrompt } from "./prompt";
import { READY_TOOL, runTool, toolDefinitions, toolStatus, type ToolContext } from "./tools";

const HISTORY_MESSAGES = 20;
const MAX_STEPS = 8;
const RECENT_ACTIONS = 10;

export type Photo = { mimeType: string; data: string };

export type TurnInput = {
  user: User;
  chatId: string;
  text: string;
  photo?: Photo;
  voice?: boolean;
};

export type TurnEvent =
  | { type: "status"; text: string }
  | { type: "text"; delta: string }
  | { type: "reset"; text: string }
  | { type: "done"; messageId: string; text: string; actions: string[]; switchTo?: string; meals: Meal[] }
  | { type: "error"; message: string };

function toModelMessage(message: ChatMessage): ChatCompletionMessageParam {
  if (message.role === "krabby") return { role: "assistant", content: message.content };
  if (message.role === "event") {
    return { role: "user", content: `[App event, not a message from the user] ${message.content}` };
  }
  const photoNote = message.has_photo ? "[The user sent a photo, which is no longer available] " : "";
  return { role: "user", content: `${photoNote}${message.content}` };
}

function toHistory(messages: ChatMessage[]) {
  // The conversation sent to the model has to start with a user turn.
  const start = messages.findIndex((message) => message.role !== "krabby");
  return start === -1 ? [] : messages.slice(start).map(toModelMessage);
}

export async function* runTurn(input: TurnInput): AsyncGenerator<TurnEvent> {
  const { chatId, text, photo, voice = false } = input;
  const context: ToolContext = { user: input.user, chatId };

  const history = await recentMessages(chatId, HISTORY_MESSAGES);
  await addMessage(chatId, { role: "user", content: text, hasPhoto: Boolean(photo) });

  const content: ChatCompletionContentPart[] = [{ type: "text", text: text || "(a photo with no message)" }];
  if (photo) {
    content.push({ type: "image_url", image_url: { url: `data:${photo.mimeType};base64,${photo.data}` } });
  }
  const conversation: ChatCompletionMessageParam[] = [...toHistory(history), { role: "user", content }];

  const recentActions = history.flatMap((message) => message.actions).slice(-RECENT_ACTIONS);
  const actions: string[] = [];
  const meals: Meal[] = [];
  let switchTo: string | undefined;
  const seenCalls = new Set<string>();
  let reply = "";

  const generate = async function* (toolChoice: "required" | "none"): AsyncGenerator<TurnEvent, ModelReply> {
    const stepStart = reply;
    const system = chatPrompt(context.user, { voice, recentActions: [...recentActions, ...actions] });
    const stream = streamReply([{ role: "system", content: system }, ...conversation], toolDefinitions, toolChoice);
    let next = await stream.next();
    while (!next.done) {
      if (next.value.type === "text") {
        reply += next.value.delta;
        yield next.value;
      } else {
        reply = stepStart;
        yield { type: "reset", text: reply };
      }
      next = await stream.next();
    }
    return next.value;
  };

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const { calls, message } = yield* generate("required");
      // Forced to call something, Gemma sometimes repeats itself instead of finishing.
      // A repeat must not run twice, or items would be added twice.
      const fresh = calls.filter(
        (call) => call.name !== READY_TOOL && !seenCalls.has(`${call.name}${JSON.stringify(call.args)}`),
      );
      if (fresh.length === 0) break;

      conversation.push(message);
      for (const call of calls) {
        if (!fresh.includes(call)) {
          conversation.push({ role: "tool", tool_call_id: call.id, content: "{}" });
          continue;
        }
        seenCalls.add(`${call.name}${JSON.stringify(call.args)}`);
        yield { type: "status", text: toolStatus(call.name) };
        const outcome = await runTool(call.name, call.args, context);
        if (outcome.action) actions.push(outcome.action);
        if (outcome.switchTo) switchTo = outcome.switchTo;
        if (outcome.meal) meals.push(outcome.meal);
        conversation.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(outcome.result) });
      }
    }

    // Only forced tool steps come first, so the reply itself streams from here.
    reply = "";
    yield { type: "reset", text: "" };
    yield* generate("none");
  } catch (error) {
    console.error("Krabby could not reply:", error);
    yield { type: "error", message: "Krabby is out of breath. Please try again in a moment." };
    return;
  }

  const fallback = actions.length > 0 ? `Done! ${actions.join(". ")}.` : "Sorry, I lost my train of thought. Try that again?";
  const finalText = reply.trim() || fallback;
  const message = await addMessage(chatId, { role: "krabby", content: finalText, actions });
  yield { type: "done", messageId: message.id, text: finalText, actions, switchTo, meals };
}
