"use client";

import { useEffect, useRef } from "react";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { discountPercent, formatPrice } from "@/lib/format";
import type { NearbyOffer } from "@/lib/products";

export function OfferDetails({ offer, onClose }: { offer: NearbyOffer; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dialog.current?.open) dialog.current?.showModal();
  }, []);

  const nutrition = [
    ["kcal", offer.kcal, ""],
    ["Protein", offer.protein_g, " g"],
    ["Carbs", offer.carbs_g, " g"],
    ["Fat", offer.fat_g, " g"],
    ["Sugar", offer.sugar_g, " g"],
  ].filter(([, value]) => value !== null);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="offer-details-title"
      onClose={onClose}
      onClick={(event) => {
        // A click on the dialog itself and not its content is a click on the backdrop.
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border bg-card text-card-foreground shadow-md backdrop:bg-black/50"
    >
      <div className="space-y-3 p-4">
        <ProductImage product={offer} className="h-40 rounded-lg p-2" />
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {offer.store}
          </Badge>
          <Badge variant="selected" className="px-3 py-1 text-sm">
            −{discountPercent(offer)}%
          </Badge>
        </div>
        <div>
          <h2 id="offer-details-title" className="text-xl font-semibold tracking-tight">
            {offer.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {offer.unit} · {offer.category}
          </p>
          {offer.nearest_store && (
            <p className="text-sm text-muted-foreground">
              Nearest: {offer.nearest_store}, {offer.nearest_km} km
            </p>
          )}
        </div>
        <p>
          <span className="text-2xl font-semibold text-selected-foreground">{formatPrice(offer.discount_cents)}</span>{" "}
          <del className="text-muted-foreground">{formatPrice(offer.regular_cents)}</del>
        </p>
        <p className="text-sm text-muted-foreground">
          You save {formatPrice(offer.regular_cents - offer.discount_cents)}
        </p>
        {nutrition.length > 0 && (
          <dl className="grid grid-cols-5 gap-1 rounded-lg bg-secondary p-2 text-center text-sm">
            {nutrition.map(([label, value, suffix]) => (
              <div key={label}>
                <dd className="font-semibold">
                  {value}
                  {suffix}
                </dd>
                <dt className="text-xs text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>
        )}
        {offer.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {offer.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                {tag}
              </li>
            ))}
          </ul>
        )}
        {offer.off_code && (
          <a
            href={`https://world.openfoodfacts.org/product/${offer.off_code}`}
            target="_blank"
            rel="noreferrer"
            className="block text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Image and nutrition per 100 g/ml: Open Food Facts (example product)
          </a>
        )}
        <form method="dialog">
          <Button variant="outline" size="lg" className="w-full">
            Close
          </Button>
        </form>
      </div>
    </dialog>
  );
}
