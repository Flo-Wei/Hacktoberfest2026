import { query } from "./db";

export type Store = { id: string; store: string; name: string; city: string; distance_km: number };

export function listStores(city: string, filters: { store?: string; maxDistanceKm?: number } = {}) {
  return query<Store>(
    `select id, store, name, city, distance_km from stores
     where city = $1
       and ($2::text is null or store ilike $2)
       and ($3::real is null or distance_km <= $3)
     order by distance_km`,
    [city, filters.store ?? null, filters.maxDistanceKm ?? null],
  );
}
