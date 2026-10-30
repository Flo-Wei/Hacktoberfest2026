"use client";

import { useEffect, useRef } from "react";
import { ProductImage } from "@/components/product-image";
import { discountPercent, price } from "@/lib/format";
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
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white shadow-md backdrop:bg-black/50"
    >
      <div className="space-y-3 p-4">
        <ProductImage product={offer} />
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium">{offer.store}</span>
          <span className="rounded-full bg-orange-600 px-3 py-1 text-sm font-bold text-white">
            -{discountPercent(offer)}%
          </span>
        </div>
        <div>
          <h2 id="offer-details-title" className="text-xl font-bold">
            {offer.name}
          </h2>
          <p className="text-sm text-stone-600">
            {offer.unit} · {offer.category}
          </p>
          {offer.nearest_store && (
            <p className="text-sm text-stone-600">
              Nearest: {offer.nearest_store}, {offer.nearest_km} km
            </p>
          )}
        </div>
        <p>
          <span className="text-2xl font-bold text-orange-600">{price.format(offer.discount_cents / 100)}</span>{" "}
          <span className="text-stone-500 line-through">{price.format(offer.regular_cents / 100)}</span>
        </p>
        <p className="text-sm text-stone-600">
          You save {price.format((offer.regular_cents - offer.discount_cents) / 100)}
        </p>
        {nutrition.length > 0 && (
          <dl className="grid grid-cols-5 gap-1 rounded-xl bg-stone-100 p-2 text-center text-sm">
            {nutrition.map(([label, value, suffix]) => (
              <div key={label}>
                <dd className="font-semibold">
                  {value}
                  {suffix}
                </dd>
                <dt className="text-xs text-stone-600">{label}</dt>
              </div>
            ))}
          </dl>
        )}
        {offer.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1">
            {offer.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs">
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
            className="block text-xs text-stone-600 underline"
          >
            Image and nutrition per 100 g/ml: Open Food Facts (example product)
          </a>
        )}
        <form method="dialog">
          <button className="w-full rounded-lg border border-stone-300 bg-white py-3 font-semibold">Close</button>
        </form>
      </div>
    </dialog>
  );
}
