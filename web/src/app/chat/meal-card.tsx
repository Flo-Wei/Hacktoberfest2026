"use client";

import { useState } from "react";
import { recordMealVote } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
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
    <details className="rounded-lg bg-secondary p-3">
      <summary className="cursor-pointer font-semibold">
        Shopping list · {formatPrice(total)}, you save {formatPrice(saved)}
      </summary>
      <div className="mt-2 space-y-3">
        {groupByStore(products).map(([store, items]) => (
          <section key={store}>
            <h4 className="font-semibold">{store}</h4>
            {items[0].nearest_store && (
              <p className="text-xs text-muted-foreground">
                Nearest: {items[0].nearest_store}, {items[0].nearest_km} km
              </p>
            )}
            <ul className="mt-1 space-y-1 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span>
                    {item.name} <span className="text-muted-foreground">({item.unit})</span>
                  </span>
                  <span className="whitespace-nowrap">
                    <span className="font-semibold text-selected-foreground">{formatPrice(item.discount_cents)}</span>{" "}
                    <del className="text-xs text-muted-foreground">{formatPrice(item.regular_cents)}</del>
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
    <Card>
      <CardHeader>
        <CardTitle className="text-xl tracking-tight">{meal.title}</CardTitle>
        <CardDescription>
          {meal.minutes} min · {meal.likes} {meal.likes === 1 ? "like" : "likes"}
        </CardDescription>
        {meal.description && <p className="text-sm">{meal.description}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold">Ingredients</h4>
          <ul className="list-disc pl-5 text-sm">
            {meal.products.map((product) => (
              <li key={product.id}>
                {product.name} ({product.unit})
              </li>
            ))}
            {meal.pantry.map((item) => (
              <li key={item} className="text-muted-foreground">
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
          <Button variant={vote === false ? "secondary" : "outline"} aria-pressed={vote === false} onClick={() => castVote(false)}>
            Dislike
          </Button>
          <Button variant={vote === true ? "default" : "outline"} aria-pressed={vote === true} onClick={() => castVote(true)}>
            Like
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">Couldn&apos;t save that. Please try again.</p>}
      </CardContent>
    </Card>
  );
}
