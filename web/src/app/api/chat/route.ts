import { getChat, getOrCreateActiveChat } from "@/lib/chats";
import { runTurn, type Photo } from "@/lib/krabby/agent";
import { getCurrentUser } from "@/lib/session";

const MAX_PHOTO_CHARS = 8_000_000;

type Body = { chatId?: string; text?: string; photo?: Photo; voice?: boolean };

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not logged in", { status: 401 });

  const body = (await request.json()) as Body;
  const text = body.text?.trim() ?? "";
  const photo = body.photo;
  if (!text && !photo) return new Response("Empty message", { status: 400 });
  if (photo && (!photo.mimeType?.startsWith("image/") || !photo.data)) {
    return new Response("Invalid photo", { status: 400 });
  }
  if (photo && photo.data.length > MAX_PHOTO_CHARS) {
    return new Response("Photo too large", { status: 413 });
  }

  const chat = body.chatId ? await getChat(user.id, body.chatId) : await getOrCreateActiveChat(user.id);
  if (!chat) return new Response("Chat not found", { status: 404 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let open = true;
      const send = (event: object) => {
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // The user left. Keep going so the reply and any actions still get saved.
          open = false;
        }
      };

      send({ type: "chat", chatId: chat.id });
      try {
        for await (const event of runTurn({ user, chatId: chat.id, text, photo, voice: body.voice })) {
          send(event);
        }
      } catch (error) {
        console.error("Chat turn failed:", error);
        send({ type: "error", message: "Something went wrong. Please try again." });
      }
      if (open) controller.close();
    },
  });

  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson", "cache-control": "no-store" },
  });
}
