-- Plain Postgres, so it also runs on Supabase or Vercel Postgres.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer not null check (age between 1 and 120),
  city text not null,
  goals text[] not null default '{}',
  preferences text[] not null default '{}',
  is_mock boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  store text not null,
  category text not null,
  unit text not null,
  regular_cents integer not null,
  discount_cents integer not null check (discount_cents < regular_cents),
  tags text[] not null default '{}',
  -- From Open Food Facts, nutrition per 100 g or ml. See db/README.md.
  image_url text,
  off_code text,
  kcal integer,
  protein_g real,
  carbs_g real,
  fat_g real,
  sugar_g real
);

create table if not exists swipes (
  user_id uuid not null references users (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  liked boolean not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists swipes_product_id_idx on swipes (product_id);

-- Made-up branches. Products have a chain in products.store, so every chain's
-- offers apply to all of its branches.
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  chain text not null,
  name text not null,
  city text not null,
  distance_km real not null
);

create index if not exists stores_chain_city_idx on stores (chain, city);

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  minutes integer not null,
  -- Ingredients people usually have at home, so not part of the offers.
  pantry text[] not null default '{}',
  steps text[] not null,
  source text not null check (source in ('seed', 'gemma', 'mock')),
  created_by uuid references users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists meal_products (
  meal_id uuid not null references meals (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  primary key (meal_id, product_id)
);

create table if not exists meal_votes (
  user_id uuid not null references users (id) on delete cascade,
  meal_id uuid not null references meals (id) on delete cascade,
  liked boolean not null,
  created_at timestamptz not null default now(),
  primary key (user_id, meal_id)
);

create index if not exists meal_votes_meal_id_idx on meal_votes (meal_id);
