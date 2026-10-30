"use client";

import { useRef } from "react";
import { addListItem, clearCheckedListItems, removeListItem, toggleListItem } from "@/app/actions";
import type { ShoppingListItem } from "@/lib/shopping-list";
import { formatPrice } from "@/lib/format";

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
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2"
        />
        <button className="rounded-lg bg-primary px-4 font-semibold text-primary-foreground">Add</button>
      </form>

      {items.length === 0 && <p className="text-muted-foreground">Your list is empty. Add something here or ask Krabby.</p>}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(event) => void toggleListItem(item.id, event.target.checked)}
              aria-label={`Check off ${item.name}`}
              className="size-5 accent-primary"
            />
            <div className={`min-w-0 flex-1 ${item.checked ? "text-muted-foreground line-through" : ""}`}>
              <p className="truncate font-medium">
                {item.name}
                {item.quantity && ` (${item.quantity})`}
              </p>
              {item.store && item.discount_cents !== null && (
                <p className="text-sm text-muted-foreground">
                  {item.store}, {formatPrice(item.discount_cents)}
                </p>
              )}
            </div>
            <button
              onClick={() => void removeListItem(item.id)}
              aria-label={`Remove ${item.name}`}
              className="px-2 text-muted-foreground"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {items.some((item) => item.checked) && (
        <button onClick={() => void clearCheckedListItems()} className="text-sm text-muted-foreground underline">
          Remove checked items
        </button>
      )}
    </div>
  );
}
