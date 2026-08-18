create table if not exists nlo_seen (
  ign text primary key,
  uuid text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  seen_count integer not null default 1
);

create index if not exists nlo_seen_last_seen_idx on nlo_seen (last_seen desc);

delete from nlo_bounties
where posted_by in ('Northwind', 'Cinderwell', 'Vesper', 'Thorn', 'PaleHarbor', 'Rook');

delete from nlo_intel;

insert into nlo_intel (title, body, kind, posted_at)
values
  (
    'Netherite Legends Odyssey',
    'The live MOTD: SMP + Economy + Ranks + Events + Seasons. Native Java is Paper 26.2. Older Java comes in through ViaBackwards.',
    'notice',
    now()
  ),
  (
    'Console is still Bedrock',
    'Xbox, PlayStation, and Switch cannot add a custom IP. Add Minecraft friend NLO#3114, then join from the friends list.',
    'notice',
    now()
  ),
  (
    'The ledger is live',
    'This site now records real names the server reports. No mock standings. If you are on nlo.gg, you will show up here.',
    'patch',
    now()
  );
