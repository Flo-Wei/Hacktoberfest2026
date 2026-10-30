import { getKrabbyMessage } from "@/lib/chats";
import { synthesize } from "@/lib/krabby/speech";
import { getCurrentUser } from "@/lib/session";

// Takes a message id, not text, so this can only speak Krabby's own saved replies.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not logged in", { status: 401 });

  const { messageId } = (await request.json()) as { messageId?: string };
  const text = messageId ? await getKrabbyMessage(user.id, messageId) : null;
  if (!text) return new Response("Message not found", { status: 404 });

  try {
    return new Response(await synthesize(text), { headers: { "content-type": "audio/mpeg" } });
  } catch (error) {
    console.error(error);
    return new Response("Speech failed", { status: 502 });
  }
}
