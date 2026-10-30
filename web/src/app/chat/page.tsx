import { getActiveChat, listMessages } from "@/lib/chats";
import { requireUser } from "@/lib/session";
import { ChatView } from "./chat-view";

const MAX_MESSAGE_LENGTH = 500;

type ChatPageProps = { searchParams: Promise<{ message?: string | string[] }> };

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const user = await requireUser();
  const { message } = await searchParams;
  const initialMessage = typeof message === "string" ? message.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
  const chat = await getActiveChat(user.id);
  const messages = chat ? await listMessages(chat.id) : [];

  return (
    <ChatView
      key={chat?.id ?? "new"}
      name={user.name}
      chatId={chat?.id ?? null}
      initialMessages={messages}
      initialMessage={initialMessage}
    />
  );
}
