"use client";

import { useState } from "react";
import { recordMealVote } from "@/app/actions";
import { price } from "@/lib/format";
import type { Meal, MealProduct } from "@/lib/meals";

function groupByStore(products: MealProduct[]) {
  const groups = new Map<string, MealProduct[]>();
  for (const product of products) {
    groups.set(product.store, [...(groups.get(product.store) ?? []), product]);
  }
  return [...groups.entries()];
}

function ShoppingList({ products }: { products: MealProduct[] }) {
  const total = products.reduce((sum, product) => sum + product.discount_cents, 0);
  const saved = products.reduce((sum, product) => sum + product.regular_cents - product.discount_cents, 0);

  return (
    <details className="rounded-xl bg-stone-100 p-3">
      <summary className="cursor-pointer font-semibold">
        Shopping list · {price.format(total / 100)}, you save {price.format(saved / 100)}
      </summary>
      <div className="mt-2 space-y-3">
        {groupByStore(products).map(([store, items]) => (
          <section key={store}>
            <h4 className="font-semibold">{store}</h4>
            {items[0].nearest_store && (
              <p className="text-xs text-stone-600">
                Nearest: {items[0].nearest_store}, {items[0].nearest_km} km
              </p>
            )}
            <ul className="mt-1 space-y-1 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span>
                    {item.name} <span className="text-stone-600">({item.unit})</span>
                  </span>
                  <span className="whitespace-nowrap">
                    <span className="font-semibold text-orange-600">{price.format(item.discount_cents / 100)}</span>{" "}
                    <span className="text-xs text-stone-500 line-through">{price.format(item.regular_cents / 100)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  );
}

export function MealCard({ meal }: { meal: Meal }) {
  const [vote, setVote] = useState(meal.my_vote);
  const [error, setError] = useState(false);

  async function castVote(liked: boolean) {
    const previous = vote;
    setVote(liked);
    setError(false);
    try {
      await recordMealVote(meal.id, liked);
    } catch {
      setVote(previous);
      setError(true);
    }
  }

  return (
    <article className="space-y-3 rounded-2xl bg-white p-4 shadow-md">
      <div>
        <h3 className="text-xl font-bold">{meal.title}</h3>
        <p className="text-sm text-stone-600">
          {meal.minutes} min · {meal.likes} {meal.likes === 1 ? "like" : "likes"}
        </p>
        {meal.description && <p className="mt-1 text-sm">{meal.description}</p>}
      </div>
      <div>
        <h4 className="font-semibold">Ingredients</h4>
        <ul className="list-disc pl-5 text-sm">
          {meal.products.map((product) => (
            <li key={product.id}>
              {product.name} ({product.unit})
            </li>
          ))}
          {meal.pantry.map((item) => (
            <li key={item} className="text-stone-600">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-semibold">Steps</h4>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {meal.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>
      <ShoppingList products={meal.products} />
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => castVote(false)}
          aria-pressed={vote === false}
          className={`rounded-lg border py-2 font-semibold ${vote === false ? "border-stone-800 bg-stone-800 text-white" : "border-stone-300 bg-white"}`}
        >
          Dislike
        </button>
        <button
          onClick={() => castVote(true)}
          aria-pressed={vote === true}
          className={`rounded-lg border py-2 font-semibold ${vote === true ? "border-orange-600 bg-orange-600 text-white" : "border-orange-600 bg-white text-orange-600"}`}
        >
          Like
        </button>
      </div>
      {error && <p className="text-sm text-red-700">Couldn&apos;t save that. Please try again.</p>}
    </article>
  );
}
