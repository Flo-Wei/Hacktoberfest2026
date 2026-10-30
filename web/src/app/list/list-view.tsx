"use client";

import { useRef } from "react";
import { addListItem, clearCheckedListItems, removeListItem, toggleListItem } from "@/app/actions";
import type { ShoppingListItem } from "@/lib/shopping-list";

const price = new Intl.NumberFormat("en-AT", { style: "currency", currency: "EUR" });

export function ListView({ items }: { items: ShoppingListItem[] }) {
  const form = useRef<HTMLFormElement>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Shopping list</h1>
      <form
        ref={form}
        action={async (data) => {
          await addListItem(data);
          form.current?.reset();
        }}
        className="flex gap-2"
      >
        <input
          name="name"
          required
          placeholder="Add an item"
          aria-label="Add an item"
          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2"
        />
        <button className="rounded-lg bg-orange-600 px-4 font-semibold text-white">Add</button>
      </form>

      {items.length === 0 && <p className="text-stone-600">Your list is empty. Add something here or ask Krabby.</p>}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-3">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(event) => void toggleListItem(item.id, event.target.checked)}
              aria-label={`Check off ${item.name}`}
              className="size-5 accent-orange-600"
            />
            <div className={`min-w-0 flex-1 ${item.checked ? "text-stone-500 line-through" : ""}`}>
              <p className="truncate font-medium">
                {item.name}
                {item.quantity && ` (${item.quantity})`}
              </p>
              {item.store && item.discount_cents !== null && (
                <p className="text-sm text-stone-600">
                  {item.store}, {price.format(item.discount_cents / 100)}
                </p>
              )}
            </div>
            <button
              onClick={() => void removeListItem(item.id)}
              aria-label={`Remove ${item.name}`}
              className="px-2 text-stone-600"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {items.some((item) => item.checked) && (
        <button onClick={() => void clearCheckedListItems()} className="text-sm text-stone-600 underline">
          Remove checked items
        </button>
      )}
    </div>
  );
}
