import { getActiveChat, listMessages } from "@/lib/chats";
import { requireUser } from "@/lib/session";
import { ChatView } from "./chat-view";

export default async function ChatPage() {
  const user = await requireUser();
  const chat = await getActiveChat(user.id);
  const messages = chat ? await listMessages(chat.id) : [];

  return <ChatView key={chat?.id ?? "new"} name={user.name} chatId={chat?.id ?? null} initialMessages={messages} />;
}
