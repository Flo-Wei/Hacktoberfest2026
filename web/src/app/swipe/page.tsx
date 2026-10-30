import { Placeholder } from "@/components/placeholder";
import { requireUser } from "@/lib/session";

export default async function SwipePage() {
  await requireUser();
  return <Placeholder title="Swipe" text="Hier swipst du durch Produkte, die ähnlichen Usern gefallen." />;
}
