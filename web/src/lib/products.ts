import { query } from "./db";
import { DIETS, GOAL_TAGS } from "./options";
import type { User } from "./users";

export type RecommendedProduct = {
  id: string;
  name: string;
  store: string;
  category: string;
  unit: string;
  regular_cents: number;
  discount_cents: number;
  image_url: string | null;
  off_code: string | null;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  reason: "similar" | "profile" | "offer";
};

// Neighbours are users whose swipes agree with this user's more often than not.
// Products are ranked by likes from neighbours, weighted by how similar they
// are, then by profile match. New users have no neighbours, so the profile decides.
export function recommendProducts(user: User, limit = 10) {
  const wanted = [
    ...new Set([...user.preferences, ...user.goals.flatMap((goal) => GOAL_TAGS[goal] ?? [])]),
  ];
  const diets = user.preferences.filter((preference) => DIETS.includes(preference));

  return query<RecommendedProduct>(
    `with mine as (
       select product_id, liked from swipes where user_id = $1::uuid
     ),
     neighbours as (
       select s.user_id, sum(case when s.liked = m.liked then 1 else -1 end) as similarity
       from swipes s
       join mine m using (product_id)
       where s.user_id <> $1::uuid
       group by s.user_id
       having sum(case when s.liked = m.liked then 1 else -1 end) > 0
     ),
     neighbour_likes as (
       select s.product_id, sum(n.similarity) as score
       from swipes s
       join neighbours n using (user_id)
       where s.liked
       group by s.product_id
     ),
     ranked as (
       select
         p.*,
         coalesce(l.score, 0) as similar_score,
         cardinality(array(select unnest(p.tags) intersect select unnest($2::text[]))) as profile_score
       from products p
       left join neighbour_likes l on l.product_id = p.id
       where p.tags @> $3::text[]
         and not exists (select 1 from mine m where m.product_id = p.id)
     )
     select
       id, name, store, category, unit, regular_cents, discount_cents, image_url,
       off_code, kcal, protein_g, carbs_g, fat_g,
       case
         when similar_score > 0 then 'similar'
         when profile_score > 0 then 'profile'
         else 'offer'
       end as reason
     from ranked
     order by
       similar_score desc,
       profile_score desc,
       (regular_cents - discount_cents)::float / regular_cents desc,
       name
     limit $4`,
    [user.id, wanted, diets, limit],
  );
}

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
};

export type NearbyOffer = Offer & { nearest_store: string | null; nearest_km: number | null };

export type OfferFilters = {
  store?: string;
  category?: string;
  search?: string;
  maxDistanceKm?: number;
};

// Offers belong to a chain, so the distance is to its nearest branch in the user's city.
export function searchOffers(city: string, filters: OfferFilters = {}, limit = 60) {
  return query<NearbyOffer>(
    `select
       p.id, p.name, p.store, p.category, p.unit, p.regular_cents, p.discount_cents, p.tags,
       p.image_url, p.off_code, p.kcal, p.protein_g, p.carbs_g, p.fat_g, p.sugar_g,
       nearest.name as nearest_store, nearest.distance_km as nearest_km
     from products p
     left join lateral (
       select s.name, s.distance_km from stores s
       where s.store = p.store and s.city = $1
       order by s.distance_km limit 1
     ) nearest on true
     where ($2::text is null or p.store ilike $2)
       and ($3::text is null or p.category ilike '%' || $3 || '%')
       and ($4::text is null or translate(lower(p.name), 'äöüß', 'aous') like '%' || translate(lower($4), 'äöüß', 'aous') || '%')
       and ($5::real is null or nearest.distance_km <= $5)
     order by p.store, (p.regular_cents - p.discount_cents)::float / p.regular_cents desc, p.name
     limit $6`,
    [
      city,
      filters.store ?? null,
      filters.category ?? null,
      filters.search ?? null,
      filters.maxDistanceKm ?? null,
      limit,
    ],
  );
}

const OFFER_COLUMNS = `id, name, store, category, unit, regular_cents, discount_cents, tags,
  image_url, off_code, kcal, protein_g, carbs_g, fat_g, sugar_g`;

export async function getOffer(productId: string) {
  const rows = await query<Offer>(`select ${OFFER_COLUMNS} from products where id::text = $1`, [productId]);
  return rows[0] ?? null;
}

export async function findOffer(name: string, store: string) {
  const rows = await query<Offer>(
    `select ${OFFER_COLUMNS} from products where name ilike $1 and store ilike $2`,
    [name, store],
  );
  return rows[0] ?? null;
}

export type SwipedProduct = {
  name: string;
  store: string | null;
  category: string | null;
  liked: boolean;
  kcal: number | null;
  protein_g: number | null;
  sugar_g: number | null;
  source: "swipe" | "photo";
};

// Photographed products count as likes, so both lists show up together.
export function listSwipes(userId: string, filters: { liked?: boolean; limit?: number } = {}) {
  return query<SwipedProduct>(
    `select * from (
       select p.name, p.store, p.category, s.liked, p.kcal, p.protein_g, p.sugar_g,
         'swipe' as source, s.created_at
       from swipes s join products p on p.id = s.product_id
       where s.user_id = $1::uuid
       union all
       select name, null, category, true, null, null, null, 'photo', created_at
       from photo_products where user_id = $1::uuid
     ) history
     where $2::boolean is null or liked = $2
     order by created_at desc
     limit $3`,
    [userId, filters.liked ?? null, filters.limit ?? 30],
  );
}

export async function savePhotoProduct(userId: string, name: string, category?: string) {
  await query(
    `insert into photo_products (user_id, name, category) values ($1::uuid, $2, $3)
     on conflict (user_id, name) do update set category = excluded.category`,
    [userId, name, category ?? null],
  );
}

export async function saveSwipe(userId: string, productId: string, liked: boolean) {
  await query(
    `insert into swipes (user_id, product_id, liked)
     select $1::uuid, id, $3 from products where id::text = $2
     on conflict (user_id, product_id) do update set liked = excluded.liked`,
    [userId, productId, liked],
  );
}
