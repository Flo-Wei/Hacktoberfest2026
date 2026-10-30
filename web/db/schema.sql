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
