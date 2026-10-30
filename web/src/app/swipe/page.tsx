import { recommendProducts } from "@/lib/products";
import { requireUser } from "@/lib/session";
import { SwipeDeck } from "./swipe-deck";

export default async function SwipePage() {
  const user = await requireUser();
  const products = await recommendProducts(user);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Swipe</h1>
        <p className="text-sm text-stone-600">Swipe right if you like it, left if you don&apos;t. Prices are mock data.</p>
      </div>
      <SwipeDeck key={products.map((product) => product.id).join()} products={products} />
      <p className="text-center text-xs text-stone-600">
        Contains data from{" "}
        <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className="underline">
          Open Food Facts
        </a>{" "}
        under the{" "}
        <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer" className="underline">
          Open Database License
        </a>
        , images under{" "}
        <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer" className="underline">
          CC BY-SA
        </a>
        .
      </p>
    </div>
  );
}
