create table if not exists nlo_players (
  ign text primary key,
  alliance text not null,
  prestige integer not null default 0,
  coins integer not null default 0,
  bounties_claimed integer not null default 0,
  kills integer not null default 0,
  deaths integer not null default 0,
  playtime_hours integer not null default 0,
  presence text not null default 'offline',
  joined_on date not null,
  bio text not null
);

create table if not exists nlo_bounties (
  id serial primary key,
  target_ign text not null,
  posted_by text not null,
  reward integer not null,
  reason text not null,
  status text not null default 'open',
  posted_at timestamptz not null default now()
);

create table if not exists nlo_intel (
  id serial primary key,
  title text not null,
  body text not null,
  kind text not null,
  posted_at timestamptz not null default now()
);

create table if not exists nlo_claims (
  user_id text primary key,
  ign text not null,
  created_at timestamptz not null default now()
);

create table if not exists nlo_watch (
  user_id text not null,
  ign text not null,
  primary key (user_id, ign)
);

insert into nlo_players (ign, alliance, prestige, coins, bounties_claimed, kills, deaths, playtime_hours, presence, joined_on, bio)
values
  ('Vesper', 'The Ridge', 1280, 84200, 19, 64, 21, 412, 'online', '2026-03-02', 'Keeps the north watch. Trades iron for silence. Rarely misses a weekly.'),
  ('IronHearth', 'Harbor Compact', 940, 121400, 11, 38, 17, 388, 'online', '2026-03-04', 'Runs the Compact forge and the only reliable netherite repair in spawn range.'),
  ('Mossline', 'Open Road', 810, 56300, 8, 22, 9, 301, 'offline', '2026-03-08', 'Builds roads, then taxes them. Claims it is civic work.'),
  ('Rook', 'The Ridge', 760, 29400, 14, 71, 33, 276, 'wanted', '2026-03-11', 'Bounty hunter. Sleeps in other people''s basements. Leaves a calling card.'),
  ('PaleHarbor', 'Harbor Compact', 620, 98800, 4, 9, 4, 254, 'online', '2026-03-14', 'Auction-house regular. Never fights if a contract will do.'),
  ('Cinderwell', 'Lowland Cartel', 580, 44100, 7, 41, 28, 219, 'offline', '2026-03-18', 'Cartel quartermaster. Specializes in night raids on poorly lit farms.'),
  ('Thorn', 'Unaligned', 505, 17800, 16, 88, 52, 198, 'wanted', '2026-03-20', 'No alliance, no apology. Currently the most expensive name on the board.'),
  ('Ashway', 'Open Road', 470, 33200, 5, 18, 12, 187, 'offline', '2026-03-22', 'Drives the east run. If the cars still start, Ashway was here.'),
  ('Kepler', 'The Ridge', 430, 25600, 6, 29, 14, 164, 'online', '2026-04-01', 'Maps the border. Posts weekly challenge clears before breakfast.'),
  ('Northwind', 'Harbor Compact', 390, 71400, 3, 7, 3, 151, 'offline', '2026-04-03', 'Fish, ice, and patient money. Funds half the Compact bounties.'),
  ('Bramble', 'Lowland Cartel', 340, 20900, 9, 35, 31, 142, 'online', '2026-04-09', 'Trap corridors. If you hear pistons, you are already late.'),
  ('Quill', 'Unaligned', 280, 12400, 2, 11, 8, 119, 'offline', '2026-04-16', 'Writes the intel board by hand. Builds libraries nobody raids twice.'),
  ('Sable', 'The Ridge', 210, 18600, 4, 16, 11, 98, 'online', '2026-05-02', 'New blood with a finished bunker. Ridge took them in after the river fight.'),
  ('Hollow', 'Open Road', 160, 9200, 1, 6, 5, 74, 'offline', '2026-05-21', 'Learns the cars. Still owes Ashway a gearbox and an apology.'),
  ('Wren', 'Unaligned', 90, 4100, 0, 2, 4, 41, 'online', '2026-06-18', 'Settler season. Built a house with actual doors. That will not last.')
on conflict (ign) do nothing;

insert into nlo_bounties (target_ign, posted_by, reward, reason, status, posted_at)
select * from (values
  ('Thorn', 'Northwind', 25000, 'Hit a Compact caravan on the east road. Took the horses.', 'open', timestamptz '2026-08-14 18:12:00+00'),
  ('Rook', 'Cinderwell', 18000, 'Emptied a Cartel stash and left a Ridge banner.', 'open', timestamptz '2026-08-13 03:40:00+00'),
  ('Bramble', 'Vesper', 12000, 'Trapped the north watch stairs. Two Ridge down.', 'open', timestamptz '2026-08-12 21:05:00+00'),
  ('Ashway', 'Thorn', 8000, 'Ran me off the road. I want the buggy back.', 'open', timestamptz '2026-08-11 16:22:00+00'),
  ('Cinderwell', 'PaleHarbor', 15000, 'Raided the harbor mill after dark.', 'claimed', timestamptz '2026-08-08 01:11:00+00'),
  ('Wren', 'Rook', 2500, 'Easy coin. New house, thin walls.', 'open', timestamptz '2026-08-16 09:04:00+00')
) as v(target_ign, posted_by, reward, reason, status, posted_at)
where not exists (select 1 from nlo_bounties);

insert into nlo_intel (title, body, kind, posted_at)
select * from (values
  ('Season One is live', 'Daily and weekly challenges are on. Prestige, funded bounties, and the boards all count toward the Season One standing. Map does not reset.', 'notice', timestamptz '2026-03-02 12:00:00+00'),
  ('Cars on the east road', 'The Open Road garage is public. Take a vehicle, bring it back, or expect a bounty. Fuel and repairs are player-run.', 'event', timestamptz '2026-05-09 17:30:00+00'),
  ('Auction House hours', 'The Harbor Compact is running evening auctions at spawn-adjacent market. No staff escrow — if you get scammed outside the AH, that is the world.', 'notice', timestamptz '2026-06-21 20:00:00+00'),
  ('Fair methods reminder', 'Raids, theft, ambushes, and build damage are legal outside protected spawn. Cheats, dupes, protection bypass, and attacks on the server are not. Ban appeals go through Discord.', 'patch', timestamptz '2026-07-18 14:00:00+00'),
  ('Bounty board refresh', 'Funded bounties now pay from the poster''s purse on claim. Unfunded names will not appear. Check the board before you hunt.', 'patch', timestamptz '2026-08-10 11:20:00+00')
) as v(title, body, kind, posted_at)
where not exists (select 1 from nlo_intel);
