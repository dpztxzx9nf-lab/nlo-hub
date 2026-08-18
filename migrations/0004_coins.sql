create table if not exists nlo_wallets (
  user_id text primary key,
  coins integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists nlo_orders (
  id serial primary key,
  user_id text not null,
  pack_id text not null,
  coins integer not null,
  usd integer not null,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

create index if not exists nlo_orders_user_idx on nlo_orders (user_id, created_at desc);
