import { query } from "./db";
import { DIETS } from "./options";
import type { User } from "./users";

export type Offer = {
  id: string;
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
  branch: string | null;
  distance_km: number | null;
};

// Every offer with the nearest branch of its chain in the user's city.
const OFFERS = `
  select
    p.id, p.name, p.store, p.category, p.unit, p.regular_cents, p.discount_cents, p.tags,
    p.image_url, p.off_code, p.kcal, p.protein_g, p.carbs_g, p.fat_g, p.sugar_g,
    b.name as branch, b.distance_km
  from products p
  left join lateral (
    select s.name, s.distance_km
    from stores s
    where s.chain = p.store and s.city = $1
    order by s.distance_km
    limit 1
  ) b on true
  where p.discount_cents < p.regular_cents`;

const ORDER = `
  order by b.distance_km, p.store, (p.regular_cents - p.discount_cents)::float / p.regular_cents desc, p.name`;

export function listOffers(city: string) {
  return query<Offer>(`${OFFERS} ${ORDER}`, [city]);
}

// What Krabby may cook with: fits the user's diet and wasn't swiped away.
export function listCookableOffers(user: User) {
  const diets = user.preferences.filter((preference) => DIETS.includes(preference));
  return query<Offer>(
    `${OFFERS}
       and p.tags @> $2::text[]
       and not exists (
         select 1 from swipes s
         where s.user_id = $3::uuid and s.product_id = p.id and not s.liked
       )
     ${ORDER}`,
    [user.city, diets, user.id],
  );
}
