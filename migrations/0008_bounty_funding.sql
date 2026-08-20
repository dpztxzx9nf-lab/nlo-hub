alter table nlo_bounties add column if not exists poster_user_id text;

create index if not exists nlo_bounties_poster_idx
  on nlo_bounties (poster_user_id, status);
