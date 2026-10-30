import { query } from "./db";

const FEED_URL = process.env.CATALOG_API_URL || "http://127.0.0.1:8000";
const ATTEMPTS = 5;
const RETRY_MS = 2000;

type FeedStore = { store: string; name: string; city: string; distance_km: number };

type FeedOffer = {
  name: string;
  store: string;
  category: string;
  unit: string;
  regular_cents: number;
  discount_cents: number;
  tags: string[];
  image_url: string | null;
  off_code: string | null;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  sugar_g: number | null;
};

async function fetchFeed<T>(path: string) {
  const response = await fetch(`${FEED_URL}${path}`, { signal: AbortSignal.timeout(3000) });
  if (!response.ok) throw new Error(`Catalog feed returned ${response.status} for ${path}`);
  return (await response.json()) as T;
}

async function importFeed() {
  const stores = await fetchFeed<FeedStore[]>("/stores");
  const offers = await fetchFeed<FeedOffer[]>("/offers");

  for (const store of stores) {
    await query(
      `insert into stores (store, name, city, distance_km) values ($1, $2, $3, $4)
       on conflict (store, name, city) do update set distance_km = excluded.distance_km`,
      [store.store, store.name, store.city, store.distance_km],
    );
  }
  // Only insert and update: deleting a product would also delete its swipes.
  for (const offer of offers) {
    await query(
      `insert into products (name, store, category, unit, regular_cents, discount_cents, tags,
         image_url, off_code, kcal, protein_g, carbs_g, fat_g, sugar_g)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       on conflict (name, store) do update set
         category = excluded.category, unit = excluded.unit,
         regular_cents = excluded.regular_cents, discount_cents = excluded.discount_cents,
         tags = excluded.tags, image_url = excluded.image_url, off_code = excluded.off_code,
         kcal = excluded.kcal, protein_g = excluded.protein_g, carbs_g = excluded.carbs_g,
         fat_g = excluded.fat_g, sugar_g = excluded.sugar_g`,
      [
        offer.name, offer.store, offer.category, offer.unit, offer.regular_cents,
        offer.discount_cents, offer.tags, offer.image_url, offer.off_code, offer.kcal,
        offer.protein_g, offer.carbs_g, offer.fat_g, offer.sugar_g,
      ],
    );
  }
  return { stores: stores.length, offers: offers.length };
}

// The feed starts alongside the app, so give it a moment. Without it the app
// keeps the data it already has.
export async function syncCatalog() {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const counts = await importFeed();
      console.log(`Catalog feed imported: ${counts.stores} stores, ${counts.offers} offers`);
      return;
    } catch (error) {
      if (attempt === ATTEMPTS) {
        console.warn(`Catalog feed unavailable, using existing data: ${error}`);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
    }
  }
}
