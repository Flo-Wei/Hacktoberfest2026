import { requireUser } from "@/lib/session";
import { KrabbyChat } from "./krabby-chat";

export default async function ChatPage() {
  const user = await requireUser();
  return <KrabbyChat name={user.name} />;
}
