alter table nlo_claims add column if not exists uuid text;
alter table nlo_claims add column if not exists verified_at timestamptz;

create index if not exists nlo_claims_ign_key_idx
  on nlo_claims ((lower(regexp_replace(ign, '^[.]+', ''))));
