import { closeActiveChats } from "@/lib/chats";
import { getCurrentUser } from "@/lib/session";

// Called when the app is opened fresh, so the next message starts a new chat.
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return new Response("Not logged in", { status: 401 });
  await closeActiveChats(user.id);
  return new Response(null, { status: 204 });
}
