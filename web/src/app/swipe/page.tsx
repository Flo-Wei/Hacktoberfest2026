import { OffCredit } from "@/components/off-credit";
import { Badge } from "@/components/ui/badge";
import { recommendProducts } from "@/lib/products";
import { requireUser } from "@/lib/session";
import { SwipeDeck } from "./swipe-deck";

export default async function SwipePage() {
  const user = await requireUser();
  const products = await recommendProducts(user);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Swipe</h1>
          <p className="text-sm text-muted-foreground max-sm:hidden">
            Swipe right if you like it, left if you don&apos;t.
          </p>
        </div>
        <Badge variant="outline">Sample prices</Badge>
      </div>
      <SwipeDeck products={products}>
        <OffCredit />
      </SwipeDeck>
    </div>
  );
}
