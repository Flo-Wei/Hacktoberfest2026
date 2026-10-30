import { notFound } from "next/navigation";
import { getChat, listMessages } from "@/lib/chats";
import { requireUser } from "@/lib/session";
import { ChatView } from "../chat-view";

export default async function SavedChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const chat = await getChat(user.id, id);
  if (!chat) notFound();

  return <ChatView key={chat.id} name={user.name} chatId={chat.id} initialMessages={await listMessages(chat.id)} />;
}
