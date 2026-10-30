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
  tags text[] not null default '{}'
);

create table if not exists swipes (
  user_id uuid not null references users (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  liked boolean not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists swipes_product_id_idx on swipes (product_id);
