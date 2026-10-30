"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Offer } from "@/lib/products";
import { OfferDetails } from "./offer-details";

const ALL = "All";

export function OfferBoard({ offers }: { offers: Offer[] }) {
  const [selected, setSelected] = useState(ALL);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [openOffer, setOpenOffer] = useState<Offer | null>(null);

  const stores = [...new Set(offers.map((offer) => offer.store))];
  const visible = selected === ALL ? stores : [selected];

  function selectStore(store: string) {
    setSelected(store);
    // Picking a store should show its offers, even if it was collapsed before.
    setCollapsed(collapsed.filter((name) => name !== store));
  }

  function toggleStore(store: string) {
    setCollapsed(collapsed.includes(store) ? collapsed.filter((name) => name !== store) : [...collapsed, store]);
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-[var(--header-height)] z-10 -mx-2 flex gap-2 overflow-x-auto rounded-xl bg-[var(--glass)] p-2 backdrop-blur-lg">
        {[ALL, ...stores].map((store) => (
          <button
            key={store}
            onClick={() => selectStore(store)}
            aria-pressed={selected === store}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              selected === store ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {store}
          </button>
        ))}
      </div>
      {visible.map((store) => {
        const storeOffers = offers.filter((offer) => offer.store === store);
        const isOpen = !collapsed.includes(store);
        return (
          <section key={store} className="space-y-2">
            <h2>
              <button
                onClick={() => toggleStore(store)}
                aria-expanded={isOpen}
                className="flex w-full items-baseline justify-between text-left"
              >
                <span className="text-xl font-semibold tracking-tight">
                  <span aria-hidden className="mr-2 inline-block w-4 text-base text-muted-foreground">
                    {isOpen ? "▾" : "▸"}
                  </span>
                  {store}
                </span>
                <span className="text-sm text-muted-foreground">{storeOffers.length} offers</span>
              </button>
            </h2>
            <div hidden={!isOpen} className={isOpen ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" : undefined}>
              {storeOffers.map((offer) => (
                <article key={offer.id}>
                  <button
                    onClick={() => setOpenOffer(offer)}
                    className="block h-full w-full cursor-pointer space-y-1 rounded-xl border bg-card p-2 text-left text-card-foreground"
                  >
                    <ProductImage product={offer} className="h-28 rounded-lg p-2" />
                    <h3 className="truncate font-semibold" title={offer.name}>
                      {offer.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{offer.unit}</p>
                    <p className="flex flex-wrap items-baseline gap-x-1">
                      <span className="font-semibold text-selected-foreground">{formatPrice(offer.discount_cents)}</span>
                      <del className="text-xs text-muted-foreground">{formatPrice(offer.regular_cents)}</del>
                      <Badge variant="selected" className="ml-auto">
                        −{discountPercent(offer)}%
                      </Badge>
                    </p>
                  </button>
                </article>
              ))}
            </div>
          </section>
        );
      })}
      {openOffer && <OfferDetails key={openOffer.id} offer={openOffer} onClose={() => setOpenOffer(null)} />}
    </div>
  );
}
