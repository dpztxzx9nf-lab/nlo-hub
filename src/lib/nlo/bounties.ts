import { getSql } from "@/lib/db";
import { BOUNTY_MAX, BOUNTY_MIN } from "@/lib/nlo/content";
import { claimedIdentity } from "@/lib/nlo/grants";
import { ignsMatch } from "@/lib/nlo/grant-shared";
import { resolveMinecraftIdentity, type SeenName } from "@/lib/nlo/ign-identity";
import { creditWallet, debitWallet, readWallet } from "@/lib/nlo/wallet";

export type BountyRow = {
  id: number;
  target_ign: string;
  posted_by: string;
  reward: number;
  reason: string;
  status: string;
  posted_at: string;
};

const globalBounty = globalThis as typeof globalThis & {
  __nloBountyTablesReady__?: Promise<void>;
};

export async function ensureBountyFunding() {
  globalBounty.__nloBountyTablesReady__ ??= (async () => {
    const sql = await getSql();
    await sql.query(`
      create table if not exists nlo_bounties (
        id serial primary key,
        target_ign text not null,
        posted_by text not null,
        reward integer not null,
        reason text not null,
        status text not null default 'open',
        posted_at timestamptz not null default now()
      )
    `);
    await sql.query(`alter table nlo_bounties add column if not exists poster_user_id text`);
  })().catch((err) => {
    globalBounty.__nloBountyTablesReady__ = undefined;
    throw err;
  });
  await globalBounty.__nloBountyTablesReady__;
}

function publicBounty(row: BountyRow): BountyRow {
  return {
    id: Number(row.id),
    target_ign: String(row.target_ign),
    posted_by: String(row.posted_by),
    reward: Number(row.reward),
    reason: String(row.reason),
    status: String(row.status),
    posted_at: String(row.posted_at ?? ""),
  };
}

export async function listBounties(): Promise<BountyRow[]> {
  try {
    await ensureBountyFunding();
    const sql = await getSql();
    const rows = await sql<BountyRow>`
      select id, target_ign, posted_by, reward, reason, status, posted_at::text as posted_at
      from nlo_bounties
      order by case when status = 'open' then 0 else 1 end, reward desc, id desc
    `;
    return rows.map(publicBounty);
  } catch {
    return [];
  }
}

export async function fundBounty(input: {
  userId: string;
  target: string;
  reward: number;
  reason: string;
  players: SeenName[];
  onlineNames: string[];
}): Promise<BountyRow> {
  await ensureBountyFunding();
  const identity = await claimedIdentity(input.userId);
  if (!identity?.ign) {
    throw new Error("Confirm the Minecraft name you join with before you fund a hunt.");
  }
  if (!Number.isInteger(input.reward) || input.reward < BOUNTY_MIN) {
    throw new Error(`Minimum bounty is ${BOUNTY_MIN.toLocaleString()} coins.`);
  }
  if (input.reward > BOUNTY_MAX) {
    throw new Error(`Maximum bounty is ${BOUNTY_MAX.toLocaleString()} coins.`);
  }
  const target = await resolveMinecraftIdentity(input.target, input.players, input.onlineNames);
  if (ignsMatch(identity.ign, target.ign)) {
    throw new Error("You cannot put a bounty on yourself.");
  }
  const wallet = await readWallet(input.userId);
  if (wallet.coins < input.reward) {
    throw new Error(
      wallet.coins < BOUNTY_MIN
        ? `Need ${BOUNTY_MIN.toLocaleString()} coins on this desk. A $1 Pebble funds one hunt.`
        : `This desk has ${wallet.coins.toLocaleString()} coins. Post that many or fewer.`,
    );
  }
  await debitWallet(input.userId, input.reward);
  try {
    const sql = await getSql();
    const rows = await sql<BountyRow>`
      insert into nlo_bounties (target_ign, posted_by, reward, reason, status, poster_user_id)
      values (${target.ign}, ${identity.ign}, ${input.reward}, ${input.reason}, 'open', ${input.userId})
      returning id, target_ign, posted_by, reward, reason, status, posted_at::text as posted_at
    `;
    if (!rows[0]) throw new Error("Could not post that bounty.");
    return publicBounty(rows[0]);
  } catch (err) {
    await creditWallet(input.userId, input.reward);
    throw err instanceof Error ? err : new Error("Could not post that bounty.");
  }
}

export async function dropBounty(userId: string, id: number): Promise<BountyRow> {
  await ensureBountyFunding();
  if (!Number.isInteger(id) || id < 1) throw new Error("Missing bounty.");
  const sql = await getSql();
  const rows = await sql<BountyRow & { reward: number }>`
    update nlo_bounties
    set status = 'dropped'
    where id = ${id}
      and poster_user_id = ${userId}
      and status = 'open'
    returning id, target_ign, posted_by, reward, reason, status, posted_at::text as posted_at
  `;
  if (!rows[0]) throw new Error("That hunt is not yours to take down.");
  await creditWallet(userId, Number(rows[0].reward));
  return publicBounty(rows[0]);
}
