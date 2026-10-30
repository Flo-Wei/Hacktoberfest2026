import { listShoppingItems } from "@/lib/shopping-list";
import { requireUser } from "@/lib/session";
import { ListView } from "./list-view";

export default async function ShoppingListPage() {
  const user = await requireUser();
  return <ListView items={await listShoppingItems(user.id)} />;
}
