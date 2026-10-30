import { addMessage, deleteMessage, getOrCreateActiveChat, recentMessages, swipesSinceLastEvent } from "@/lib/chats";
import { getOffer } from "@/lib/products";
import type { User } from "@/lib/users";
import { generateText } from "./model";
import { commentPrompt } from "./prompt";
import { judgeSwipe, SWIPES_BETWEEN_COMMENTS, type Verdict } from "./rules";

const CONTEXT_MESSAGES = 6;

export type Comment = { chatId: string; messageId: string; text: string };

// The event row goes in first, so swipes that follow count against the limit
// while the model is still writing. It's removed again if the comment fails.
async function writeComment(user: User, event: string, verdict: Verdict): Promise<Comment | null> {
  const chat = await getOrCreateActiveChat(user.id);
  const earlier = await recentMessages(chat.id, CONTEXT_MESSAGES);
  const eventRow = await addMessage(chat.id, { role: "event", content: event });

  try {
    const context = earlier.map((message) => `${message.role}: ${message.content}`).join("\n");
    const hint = verdict.kind === "against" ? "Tease them gently." : "Praise them.";
    const text = await generateText(
      commentPrompt(user),
      `${context ? `Recent chat:\n${context}\n\n` : ""}${verdict.reason} ${hint}`,
    );
    if (!text) throw new Error("Empty comment");
    const message = await addMessage(chat.id, { role: "krabby", content: text });
    return { chatId: chat.id, messageId: message.id, text };
  } catch (error) {
    console.warn("Skipping Krabby's comment:", error);
    await deleteMessage(eventRow.id);
    return null;
  }
}

export async function commentOnSwipe(user: User, productId: string, liked: boolean) {
  const swipes = await swipesSinceLastEvent(user.id);
  if (swipes !== null && swipes < SWIPES_BETWEEN_COMMENTS) return null;

  const product = await getOffer(productId);
  if (!product) return null;

  const verdict = judgeSwipe(user, product, liked);
  if (!verdict) return null;

  return writeComment(user, `You ${liked ? "liked" : "turned down"} ${product.name}`, verdict);
}
