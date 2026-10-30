-- 10 starter meals. Product names must match seed-products.sql.
insert into meals (title, description, minutes, pantry, steps, source) values
  ('Chicken and broccoli pasta', 'A filling high protein pasta for after training.', 25,
    ARRAY['Olive oil', 'Garlic', 'Salt'],
    ARRAY['Cook the pasta and add the broccoli for the last 4 minutes.', 'Fry the sliced chicken with oil and garlic until golden.', 'Toss everything together and season with salt.'], 'seed'),
  ('Red lentil dal with spinach', 'A warming vegan curry that costs very little.', 30,
    ARRAY['Curry powder', 'Onion', 'Salt'],
    ARRAY['Cook the rice.', 'Fry the onion with curry powder, add the lentils and cover with water.', 'Simmer for 15 minutes, then stir in the spinach and serve with the rice.'], 'seed'),
  ('Smoked tofu stir-fry', 'Quick vegan stir-fry with lots of protein.', 25,
    ARRAY['Soy sauce', 'Oil'],
    ARRAY['Cook the rice.', 'Fry the diced tofu until crisp.', 'Add the frozen vegetables, cook until hot, and finish with soy sauce.'], 'seed'),
  ('Salmon with potatoes and zucchini', 'A simple tray bake from one pan.', 40,
    ARRAY['Olive oil', 'Lemon', 'Salt'],
    ARRAY['Roast the diced potatoes with oil at 200 degrees for 20 minutes.', 'Add the sliced zucchini and the salmon.', 'Roast for 12 more minutes and finish with lemon.'], 'seed'),
  ('Overnight oats with blueberries', 'A breakfast you make the evening before.', 5,
    ARRAY['Honey'],
    ARRAY['Stir the oats into the skyr with a little water and honey.', 'Leave in the fridge overnight.', 'Top with the blueberries.'], 'seed'),
  ('Turkey schnitzel with tomato salad', 'Light, low carb and ready in no time.', 20,
    ARRAY['Olive oil', 'Vinegar', 'Salt'],
    ARRAY['Fry the turkey for 3 minutes on each side.', 'Mix the spinach and sliced tomatoes with oil and vinegar.', 'Serve the schnitzel on the salad.'], 'seed'),
  ('Chickpea and tomato stew', 'A cheap vegan stew with bread for dipping.', 25,
    ARRAY['Onion', 'Paprika powder', 'Salt'],
    ARRAY['Fry the onion with paprika powder.', 'Add the tomatoes and chickpeas and simmer for 15 minutes.', 'Season and serve with the bread.'], 'seed'),
  ('Caprese omelette', 'A vegetarian dinner with very few carbs.', 15,
    ARRAY['Butter', 'Basil', 'Salt'],
    ARRAY['Beat the eggs with salt.', 'Cook in butter over medium heat.', 'Top with tomato, mozzarella and basil, then fold.'], 'seed'),
  ('Beef bolognese', 'The classic, with wholegrain pasta for longer energy.', 35,
    ARRAY['Onion', 'Olive oil', 'Oregano'],
    ARRAY['Fry the onion and the beef.', 'Add the tomatoes and oregano and simmer for 20 minutes.', 'Serve over the cooked pasta.'], 'seed'),
  ('Banana almond porridge', 'A sweet vegan breakfast in 10 minutes.', 10,
    ARRAY['Cinnamon'],
    ARRAY['Simmer the oats in the oat drink for 5 minutes.', 'Slice the banana and chop the almonds.', 'Top the porridge with both and add cinnamon.'], 'seed');

insert into meal_products (meal_id, product_id)
select m.id, p.id
from (values
  ('Chicken and broccoli pasta', 'Hühnerbrustfilet'),
  ('Chicken and broccoli pasta', 'Brokkoli'),
  ('Chicken and broccoli pasta', 'Vollkornnudeln'),
  ('Red lentil dal with spinach', 'Rote Linsen'),
  ('Red lentil dal with spinach', 'Babyspinat'),
  ('Red lentil dal with spinach', 'Bio-Vollkornreis'),
  ('Smoked tofu stir-fry', 'Räuchertofu'),
  ('Smoked tofu stir-fry', 'Tiefkühl-Gemüsepfanne'),
  ('Smoked tofu stir-fry', 'Bio-Vollkornreis'),
  ('Salmon with potatoes and zucchini', 'Lachsfilet'),
  ('Salmon with potatoes and zucchini', 'Bio-Erdäpfel'),
  ('Salmon with potatoes and zucchini', 'Zucchini'),
  ('Overnight oats with blueberries', 'Haferflocken'),
  ('Overnight oats with blueberries', 'Skyr Natur'),
  ('Overnight oats with blueberries', 'Heidelbeeren'),
  ('Turkey schnitzel with tomato salad', 'Putenschnitzel'),
  ('Turkey schnitzel with tomato salad', 'Babyspinat'),
  ('Turkey schnitzel with tomato salad', 'Paradeiser aus dem Burgenland'),
  ('Chickpea and tomato stew', 'Kichererbsen'),
  ('Chickpea and tomato stew', 'Paradeiser aus dem Burgenland'),
  ('Chickpea and tomato stew', 'Vollkornbrot'),
  ('Caprese omelette', 'Bio-Eier'),
  ('Caprese omelette', 'Mozzarella'),
  ('Caprese omelette', 'Paradeiser aus dem Burgenland'),
  ('Beef bolognese', 'Rinderfaschiertes'),
  ('Beef bolognese', 'Vollkornnudeln'),
  ('Beef bolognese', 'Paradeiser aus dem Burgenland'),
  ('Banana almond porridge', 'Haferflocken'),
  ('Banana almond porridge', 'Haferdrink'),
  ('Banana almond porridge', 'Bananen'),
  ('Banana almond porridge', 'Mandeln')
) as v (title, product)
join meals m on m.title = v.title
join products p on p.name = v.product;

-- Each persona votes on about half the meals. Meals with a matching preference
-- are mostly liked, and diets are respected. The hash keeps results repeatable.
insert into meal_votes (user_id, meal_id, liked)
select
  user_id,
  meal_id,
  case
    when not fits_diet then false
    when matches then (hash / 100) % 10 < 8
    else (hash / 100) % 10 < 3
  end
from (
  select
    u.id as user_id,
    m.id as meal_id,
    abs(hashtext(u.name || m.title)::bigint) as hash,
    not exists (
      select 1
      from meal_products mp
      join products p on p.id = mp.product_id
      where mp.meal_id = m.id
        and not p.tags @> array(select unnest(u.preferences) intersect select unnest(ARRAY['Vegan', 'Vegetarian']))
    ) as fits_diet,
    exists (
      select 1
      from meal_products mp
      join products p on p.id = mp.product_id
      where mp.meal_id = m.id and p.tags && u.preferences
    ) as matches
  from users u
  cross join meals m
  where u.is_mock
) as votes
where hash % 2 = 0;
