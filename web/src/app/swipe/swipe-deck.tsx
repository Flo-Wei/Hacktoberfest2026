"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { recordSwipe } from "@/app/actions";
import { ProductImage } from "@/components/product-image";
import { discountPercent, price } from "@/lib/format";
import type { RecommendedProduct } from "@/lib/products";

const THRESHOLD = 100;
const EXIT_MS = 200;

const REASONS = {
  similar: "Liked by similar users",
  profile: "Matches your profile",
  offer: "Good offer",
};

export function SwipeDeck({ products }: { products: RecommendedProduct[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startX = useRef(0);

  const product = products[index];

  if (!product) {
    return (
      <p className="rounded-2xl bg-white p-6 text-center text-stone-600">
        {products.length === 0 ? "You've swiped all the offers!" : "Loading new suggestions..."}
      </p>
    );
  }

  const percent = discountPercent(product);

  async function swipe(liked: boolean) {
    if (leaving) return;
    setLeaving(true);
    setDragging(false);
    setOffset(liked ? 500 : -500);
    setError(null);

    const saved = recordSwipe(product.id, liked);
    await new Promise((resolve) => setTimeout(resolve, EXIT_MS));
    try {
      await saved;
    } catch {
      setError("Couldn't save that. Please try again.");
      setOffset(0);
      setLeaving(false);
      return;
    }

    setOffset(0);
    setLeaving(false);
    setIndex(index + 1);
    // Rank the next batch with the swipes from this one.
    if (index + 1 === products.length) router.refresh();
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(offset) >= THRESHOLD) void swipe(offset > 0);
    else setOffset(0);
  }

  return (
    <div className="space-y-4">
      <div
        onPointerDown={(event) => {
          if (leaving) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          startX.current = event.clientX;
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (dragging) setOffset(event.clientX - startX.current);
        }}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          setDragging(false);
          setOffset(0);
        }}
        style={{
          transform: `translateX(${offset}px) rotate(${offset / 20}deg)`,
          transition: dragging ? "none" : `transform ${EXIT_MS}ms ease-out`,
        }}
        className="relative cursor-grab touch-none select-none space-y-2 rounded-2xl bg-white p-4 shadow-md active:cursor-grabbing"
      >
        <ProductImage key={product.id} product={product} />
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium">{product.store}</span>
          <span className="rounded-full bg-orange-600 px-3 py-1 text-sm font-bold text-white">-{percent}%</span>
        </div>
        <div>
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p className="text-sm text-stone-600">
            {product.unit} · {product.category}
          </p>
        </div>
        <p>
          <span className="text-2xl font-bold text-orange-600">{price.format(product.discount_cents / 100)}</span>{" "}
          <span className="text-stone-500 line-through">{price.format(product.regular_cents / 100)}</span>
        </p>
        {product.kcal !== null && (
          <dl className="grid grid-cols-4 gap-1 rounded-xl bg-stone-100 p-2 text-center text-sm">
            {[
              ["kcal", product.kcal],
              ["Protein", `${product.protein_g} g`],
              ["Carbs", `${product.carbs_g} g`],
              ["Fat", `${product.fat_g} g`],
            ].map(([label, value]) => (
              <div key={label}>
                <dd className="font-semibold">{value}</dd>
                <dt className="text-xs text-stone-600">{label}</dt>
              </div>
            ))}
          </dl>
        )}
        <p className="text-sm text-stone-600">{REASONS[product.reason]}</p>
        {product.off_code && (
          <a
            href={`https://world.openfoodfacts.org/product/${product.off_code}`}
            target="_blank"
            rel="noreferrer"
            onPointerDown={(event) => event.stopPropagation()}
            className="block text-xs text-stone-600 underline"
          >
            Image and nutrition per 100 g/ml: Open Food Facts (example product)
          </a>
        )}
        {offset !== 0 && !leaving && (
          <span
            aria-hidden
            className={`absolute top-6 left-6 rounded-full bg-white px-3 py-1 font-bold shadow ${offset > 0 ? "text-green-700" : "text-red-700"}`}
          >
            {offset > 0 ? "Like" : "No thanks"}
          </span>
        )}
      </div>
      {error && <p className="text-center text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => swipe(false)}
          disabled={leaving}
          className="rounded-lg border border-stone-300 bg-white py-3 font-semibold disabled:opacity-60"
        >
          No thanks
        </button>
        <button
          onClick={() => swipe(true)}
          disabled={leaving}
          className="rounded-lg bg-orange-600 py-3 font-semibold text-white disabled:opacity-60"
        >
          Like
        </button>
      </div>
    </div>
  );
}
