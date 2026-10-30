import type { Content, Part } from "@google/genai";
import { addMessage, recentMessages, type ChatMessage } from "@/lib/chats";
import type { User } from "@/lib/users";
import { streamReply } from "./model";
import { chatPrompt } from "./prompt";
import { runTool, toolDeclarations, toolStatus, type Area, type ToolContext } from "./tools";

const HISTORY_MESSAGES = 20;
const MAX_STEPS = 7;
const RECENT_ACTIONS = 10;
// The free tier allows 16,000 input tokens a minute, and every step resends this.
const MAX_HISTORY_CHARS = 6000;

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
  | { type: "done"; messageId: string; text: string; actions: string[]; switchTo?: string }
  | { type: "error"; message: string };

function toContent(message: ChatMessage): Content {
  if (message.role === "krabby") return { role: "model", parts: [{ text: message.content }] };
  if (message.role === "event") {
    return { role: "user", parts: [{ text: `[App event, not a message from the user] ${message.content}` }] };
  }
  const photoNote = message.has_photo ? "[The user sent a photo, which is no longer available] " : "";
  return { role: "user", parts: [{ text: `${photoNote}${message.content}` }] };
}

function toHistory(messages: ChatMessage[]) {
  let chars = 0;
  let start = messages.length;
  while (start > 0 && chars + messages[start - 1].content.length <= MAX_HISTORY_CHARS) {
    start--;
    chars += messages[start].content.length;
  }
  // The conversation sent to the model has to start with a user turn.
  while (start < messages.length && messages[start].role === "krabby") start++;
  return messages.slice(start).map(toContent);
}

export async function* runTurn(input: TurnInput): AsyncGenerator<TurnEvent> {
  const { chatId, text, photo, voice = false } = input;
  // A photo is almost always a product to save, so skip the step that picks tools.
  const areas = new Set<Area>(photo ? ["offers", "swipes"] : []);
  const context: ToolContext = { user: input.user, chatId, areas };

  const history = await recentMessages(chatId, HISTORY_MESSAGES);
  await addMessage(chatId, { role: "user", content: text, hasPhoto: Boolean(photo) });

  const parts: Part[] = [{ text: text || "(a photo with no message)" }];
  if (photo) parts.push({ inlineData: photo });
  const contents: Content[] = [...toHistory(history), { role: "user", parts }];

  const recentActions = history.flatMap((message) => message.actions).slice(-RECENT_ACTIONS);
  const actions: string[] = [];
  let switchTo: string | undefined;
  let reply = "";

  // Events from the model callbacks wait here until the generator can yield them.
  const queue: TurnEvent[] = [];
  let wake: (() => void) | null = null;
  const push = (event: TurnEvent) => {
    queue.push(event);
    wake?.();
  };

  for (let step = 0; step < MAX_STEPS; step++) {
    const stepStart = reply;
    const call = streamReply(
      contents,
      {
        systemInstruction: chatPrompt(context.user, { voice, recentActions: [...recentActions, ...actions] }),
        tools: [{ functionDeclarations: toolDeclarations(context.areas) }],
      },
      (delta) => {
        reply += delta;
        push({ type: "text", delta });
      },
      (rateLimited) => {
        reply = stepStart;
        push({ type: "reset", text: reply });
        if (rateLimited) push({ type: "status", text: "Catching my breath" });
      },
    );

    let settled = false;
    const finished = call.finally(() => {
      settled = true;
      wake?.();
    });
    finished.catch(() => {});

    while (!settled || queue.length > 0) {
      if (queue.length === 0) await new Promise<void>((resolve) => (wake = resolve));
      wake = null;
      while (queue.length > 0) yield queue.shift()!;
    }

    let result;
    try {
      result = await call;
    } catch (error) {
      console.error("Krabby could not reply:", error);
      yield { type: "error", message: "Krabby is out of breath. Please try again in a moment." };
      return;
    }

    if (result.calls.length === 0) break;

    contents.push(result.content);
    const responses: Part[] = [];
    for (const functionCall of result.calls) {
      yield { type: "status", text: toolStatus(functionCall.name) };
      const outcome = await runTool(functionCall.name, functionCall.args ?? {}, context);
      if (outcome.action) actions.push(outcome.action);
      if (outcome.switchTo) switchTo = outcome.switchTo;
      responses.push({
        functionResponse: {
          id: functionCall.id,
          name: functionCall.name,
          response: { result: outcome.result },
        },
      });
    }
    contents.push({ role: "user", parts: responses });
  }

  const content = reply.trim() || (actions.length > 0 ? `Done! ${actions.join(". ")}.` : "Sorry, I lost my train of thought. Try that again?");
  const message = await addMessage(chatId, { role: "krabby", content, actions });
  yield { type: "done", messageId: message.id, text: content, actions, switchTo };
}
