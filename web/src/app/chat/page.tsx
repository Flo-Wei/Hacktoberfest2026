import { requireUser } from "@/lib/session";
import { MockChat } from "./mock-chat";

export default async function ChatPage() {
  const user = await requireUser();
  return <MockChat name={user.name} />;
}
