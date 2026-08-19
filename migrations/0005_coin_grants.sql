-- Shop coin packs credit the desk wallet (0004) and enqueue an in-game grant.
-- NLOP on the Paper box drains pending rows through /api/internal/coin-grants.

create table if not exists nlo_coin_grants (
  id bigserial primary key,
  user_id text not null,
  ign text,
  coins integer not null check (coins > 0),
  stripe_session_id text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  attempted_at timestamptz
);

create unique index if not exists nlo_coin_grants_stripe_session
  on nlo_coin_grants (stripe_session_id);

create index if not exists nlo_coin_grants_user_idx
  on nlo_coin_grants (user_id, created_at desc);

create index if not exists nlo_coin_grants_pending_idx
  on nlo_coin_grants (status, ign, id);

-- Existing paid shop orders become pending grants (no double-insert).
insert into nlo_coin_grants (user_id, ign, coins, stripe_session_id, status)
select o.user_id, c.ign, o.coins, o.stripe_session_id, 'pending'
from nlo_orders o
left join nlo_claims c on c.user_id = o.user_id
left join nlo_coin_grants g on g.stripe_session_id = o.stripe_session_id
where o.stripe_session_id is not null
  and o.status = 'paid'
  and o.coins > 0
  and g.id is null;
