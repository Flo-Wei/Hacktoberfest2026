import Link from "next/link";
import { listChats } from "@/lib/chats";
import { requireUser } from "@/lib/session";

const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function ChatHistoryPage() {
  const user = await requireUser();
  const chats = await listChats(user.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Past chats</h1>
        <Link href="/chat" className="text-sm text-stone-600 underline">
          Back to chat
        </Link>
      </div>
      {chats.length === 0 && <p className="text-stone-600">No chats yet.</p>}
      <ul className="space-y-2">
        {chats.map((chat) => (
          <li key={chat.id}>
            <Link href={`/chat/${chat.id}`} className="block rounded-lg border border-stone-200 bg-white p-3">
              <span className="block truncate font-medium">{chat.title || "Photo"}</span>
              <span className="text-sm text-stone-600">{date.format(new Date(chat.last_message_at))}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
