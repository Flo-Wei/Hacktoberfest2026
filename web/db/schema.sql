-- Plain Postgres, so it also runs on Supabase or Vercel Postgres.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age integer not null check (age between 1 and 120),
  city text not null,
  goals text[] not null default '{}',
  preferences text[] not null default '{}',
  avatar text,
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

-- Offers are matched by name and store when the catalog feed is imported.
create unique index if not exists products_name_store_idx on products (name, store);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  store text not null,
  name text not null,
  city text not null,
  distance_km real not null,
  unique (store, name, city)
);

create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  closed boolean not null default false,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index if not exists chats_user_id_idx on chats (user_id, last_message_at desc);

-- role 'event' is something the user did in the app that Krabby commented on.
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats (id) on delete cascade,
  role text not null check (role in ('user', 'krabby', 'event')),
  content text not null,
  has_photo boolean not null default false,
  actions text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_chat_id_idx on chat_messages (chat_id, created_at);

-- Photographed products that aren't in the catalog. Swipes can only point to catalog rows.
create table if not exists photo_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  name text not null,
  category text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  name text not null,
  quantity text,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists shopping_list_items_user_id_idx on shopping_list_items (user_id, created_at);
