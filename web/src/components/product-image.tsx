"use client";

import { useState } from "react";

const CATEGORY_ICONS: Record<string, string> = {
  "Meat & Fish": "🍗",
  "Vegan & Vegetarian": "🌱",
  Dairy: "🥛",
  "Fruit & Vegetables": "🥦",
  Pantry: "🥫",
  "Ready Meals": "🍱",
  "Sweets & Snacks": "🍫",
  Bakery: "🥐",
  Drinks: "🧃",
};

type Props = {
  product: { id: string; name: string; category: string; image_url: string | null };
};

export function ProductImage({ product }: Props) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-28 items-center justify-center overflow-hidden rounded-xl bg-orange-50">
      {product.image_url && !failed ? (
        // External store links, so next/image would need every host configured.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={product.id}
          src={product.image_url}
          alt={product.name}
          draggable={false}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <span aria-hidden className="text-6xl">
          {CATEGORY_ICONS[product.category] ?? "🛒"}
        </span>
      )}
    </div>
  );
}
