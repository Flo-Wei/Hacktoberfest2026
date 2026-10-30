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

export function listOffers() {
  return query<Offer>(
    `select id, name, store, category, unit, regular_cents, discount_cents, tags, image_url,
       off_code, kcal, protein_g, carbs_g, fat_g, sugar_g
     from products
     where discount_cents < regular_cents
     order by store, (regular_cents - discount_cents)::float / regular_cents desc, name`,
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
