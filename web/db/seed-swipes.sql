-- Each persona swipes about 40% of the products. Matching preferences are mostly
-- liked, others rarely, and diets are respected. The hash keeps results repeatable.
insert into swipes (user_id, product_id, liked)
select
  user_id,
  product_id,
  case
    when not fits_diet then false
    when matches then (hash / 100) % 10 < 8
    else (hash / 100) % 10 < 2
  end
from (
  select
    u.id as user_id,
    p.id as product_id,
    abs(hashtext(u.name || p.name)::bigint) as hash,
    p.tags && u.preferences as matches,
    (not 'Vegan' = any(u.preferences) or 'Vegan' = any(p.tags))
      and (not 'Vegetarian' = any(u.preferences) or 'Vegetarian' = any(p.tags)) as fits_diet
  from users u
  cross join products p
  where u.is_mock
) as pairs
where hash % 100 < 40;
