import { timingSafeEqual } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { getSql } from "@/lib/db";
import {
  ignKey,
  isValidIgn,
  publicGrantStatus,
  type GrantDesk,
  type GrantRow,
} from "@/lib/nlo/grant-shared";

export type { GrantDesk, GrantRow, GrantStatus } from "@/lib/nlo/grant-shared";
export {
  deliveryToast,
  ignKey,
  ignsMatch,
  isValidIgn,
  publicGrantStatus,
} from "@/lib/nlo/grant-shared";

const globalGrant = globalThis as typeof globalThis & {
  __nloGrantTablesReady__?: Promise<void>;
};

const DELIVERABLE_WHERE = `
  ign is not null
  and ign <> ''
  and (
    status = 'pending'
    or (
      status = 'delivering'
      and attempted_at is not null
      and attempted_at < now() - interval '2 minutes'
    )
  )
`;
const GRANT_COLUMNS = `
  id, user_id, ign, coins, stripe_session_id, status,
  created_at::text as created_at,
  delivered_at::text as delivered_at,
  attempted_at::text as attempted_at
`;

export function internalSecret(): string {
  return process.env.NLO_INTERNAL_SECRET?.trim() || "";
}

const pluginSeenRef = globalThis as typeof globalThis & { __nloPluginSeenAt__?: number };
const PLUGIN_SEEN_MS = 45_000;
const PLUGIN_SEEN_FILE = process.env.NLO_PLUGIN_SEEN_FILE?.trim() || "/tmp/nlo-plugin-seen";

function readPluginSeenFile(): number | undefined {
  try {
    const raw = Number(readFileSync(PLUGIN_SEEN_FILE, "utf8").trim());
    return Number.isFinite(raw) && raw > 0 ? raw : undefined;
  } catch {
    return undefined;
  }
}

/** Call after a successful NLOCoins poll so shop status can show the Paper box is live. */
export function notePluginPoll() {
  const now = Date.now();
  pluginSeenRef.__nloPluginSeenAt__ = now;
  try {
    writeFileSync(PLUGIN_SEEN_FILE, String(now));
  } catch {
    /* preview / read-only fs */
  }
}

export function pluginSeen(now = Date.now()) {
  const at = pluginSeenRef.__nloPluginSeenAt__ ?? readPluginSeenFile();
  if (at && !pluginSeenRef.__nloPluginSeenAt__) pluginSeenRef.__nloPluginSeenAt__ = at;
  return Boolean(at && now - at < PLUGIN_SEEN_MS);
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    const dummy = left.length ? left : Buffer.from([0]);
    timingSafeEqual(dummy, dummy);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function authorizeInternal(request: Request): boolean {
  const expected = internalSecret();
  if (!expected) return false;
  const header =
    request.headers.get("authorization") || request.headers.get("x-nlo-internal-secret") || "";
  const provided = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : header.trim();
  return safeEqual(provided, expected);
}

export function unauthorizedInternal(): Response {
  if (!internalSecret()) {
    return Response.json({ error: "In-game delivery is not configured." }, { status: 503 });
  }
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

export async function ensureGrantTables() {
  globalGrant.__nloGrantTablesReady__ ??= (async () => {
    await ensureGrantTablesOnce();
  })().catch((err) => {
    globalGrant.__nloGrantTablesReady__ = undefined;
    throw err;
  });
  await globalGrant.__nloGrantTablesReady__;
}

async function ensureGrantTablesOnce() {
  const sql = await getSql();
  await sql.query(`
    create table if not exists nlo_coin_grants (
      id bigserial primary key,
      user_id text not null,
      ign text,
      coins integer not null,
      stripe_session_id text not null,
      status text not null default 'pending',
      created_at timestamptz not null default now(),
      delivered_at timestamptz,
      attempted_at timestamptz
    )
  `);
  await sql.query(`
    create unique index if not exists nlo_coin_grants_stripe_session
    on nlo_coin_grants (stripe_session_id)
  `);
  await sql.query(`
    create index if not exists nlo_coin_grants_user_idx
    on nlo_coin_grants (user_id, created_at desc)
  `);
  await sql.query(`
    create table if not exists nlo_claims (
      user_id text primary key,
      ign text not null,
      uuid text,
      verified_at timestamptz,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`alter table nlo_claims add column if not exists uuid text`);
  await sql.query(`alter table nlo_claims add column if not exists verified_at timestamptz`);
  try {
    await sql.query(`alter table nlo_orders add column if not exists stripe_session_id text`);
    await sql.query(`
      insert into nlo_coin_grants (user_id, ign, coins, stripe_session_id, status)
      select o.user_id, c.ign, o.coins, o.stripe_session_id, 'pending'
      from nlo_orders o
      left join nlo_claims c on c.user_id = o.user_id
      left join nlo_coin_grants g on g.stripe_session_id = o.stripe_session_id
      where o.stripe_session_id is not null
        and o.status = 'paid'
        and o.coins > 0
        and g.id is null
    `);
  } catch {
    // nlo_orders may not exist yet on a fresh preview database.
  }
}

function normalizeGrant(row: GrantRow): GrantRow {
  return {
    id: Number(row.id),
    user_id: String(row.user_id),
    ign: row.ign ? String(row.ign) : null,
    coins: Number(row.coins),
    stripe_session_id: String(row.stripe_session_id),
    status: publicGrantStatus(String(row.status)) === "delivered"
      ? "delivered"
      : String(row.status) === "failed"
        ? "failed"
        : String(row.status) === "delivering"
          ? "delivering"
          : "pending",
    created_at: String(row.created_at ?? ""),
    delivered_at: row.delivered_at ? String(row.delivered_at) : null,
    attempted_at: row.attempted_at ? String(row.attempted_at) : null,
  };
}

export type ClaimedIdentity = {
  ign: string;
  uuid: string | null;
};

async function claimedIdentity(userId: string): Promise<ClaimedIdentity | null> {
  const sql = await getSql();
  const rows = await sql<{ ign: string; uuid: string | null }>`
    select ign, uuid from nlo_claims where user_id = ${userId} limit 1
  `;
  if (!rows[0]?.ign) return null;
  return { ign: String(rows[0].ign), uuid: rows[0].uuid ? String(rows[0].uuid) : null };
}

async function claimedIgn(userId: string): Promise<string | null> {
  const identity = await claimedIdentity(userId);
  return identity?.ign ?? null;
}

export { claimedIdentity };

export async function readGrantBySession(sessionId: string): Promise<GrantRow | null> {
  if (!sessionId.startsWith("cs_")) return null;
  await ensureGrantTables();
  const sql = await getSql();
  const rows = await sql<GrantRow>`
    select id, user_id, ign, coins, stripe_session_id, status,
           created_at::text as created_at,
           delivered_at::text as delivered_at,
           attempted_at::text as attempted_at
    from nlo_coin_grants
    where stripe_session_id = ${sessionId}
    limit 1
  `;
  return rows[0] ? normalizeGrant(rows[0]) : null;
}

export async function enqueuePaidGrant(input: {
  userId: string;
  coins: number;
  stripeSessionId: string;
}): Promise<GrantRow> {
  if (!input.stripeSessionId.startsWith("cs_")) throw new Error("Invalid checkout.");
  if (!Number.isInteger(input.coins) || input.coins < 1) throw new Error("Invalid coin amount.");
  await ensureGrantTables();
  const sql = await getSql();
  const ign = await claimedIgn(input.userId);
  await sql`
    insert into nlo_coin_grants (user_id, ign, coins, stripe_session_id, status)
    values (${input.userId}, ${ign}, ${input.coins}, ${input.stripeSessionId}, 'pending')
    on conflict (stripe_session_id) do nothing
  `;
  const rows = await sql<GrantRow>`
    select id, user_id, ign, coins, stripe_session_id, status,
           created_at::text as created_at,
           delivered_at::text as delivered_at,
           attempted_at::text as attempted_at
    from nlo_coin_grants
    where stripe_session_id = ${input.stripeSessionId}
    limit 1
  `;
  if (!rows[0]) throw new Error("Could not queue in-game coins.");
  return normalizeGrant(rows[0]);
}

export async function bindPendingGrants(userId: string, ign: string): Promise<number> {
  if (!isValidIgn(ign)) throw new Error("Use a Minecraft name.");
  await ensureGrantTables();
  const sql = await getSql();
  const rows = await sql<{ id: number }>`
    update nlo_coin_grants
    set ign = ${ign.trim()}
    where user_id = ${userId}
      and status in ('pending', 'delivering')
    returning id
  `;
  return rows.length;
}

export async function claimIgnAvailable(userId: string, ign: string): Promise<boolean> {
  const sql = await getSql();
  const key = ignKey(ign);
  const rows = await sql<{ user_id: string; ign: string }>`
    select user_id, ign from nlo_claims
    where lower(regexp_replace(ign, '^[.]+', '')) = ${key}
      and user_id <> ${userId}
    limit 1
  `;
  return !rows[0];
}

export async function saveVerifiedClaim(
  userId: string,
  identity: { ign: string; uuid: string | null },
): Promise<string> {
  if (!isValidIgn(identity.ign)) throw new Error("Use a Minecraft name.");
  const available = await claimIgnAvailable(userId, identity.ign);
  if (!available) throw new Error("That IGN is already claimed.");
  await ensureGrantTables();
  const sql = await getSql();
  await sql`
    insert into nlo_claims (user_id, ign, uuid, verified_at)
    values (${userId}, ${identity.ign}, ${identity.uuid}, now())
    on conflict (user_id) do update set
      ign = excluded.ign,
      uuid = coalesce(excluded.uuid, nlo_claims.uuid),
      verified_at = now()
  `;
  await bindPendingGrants(userId, identity.ign);
  return identity.ign;
}

export async function readGrantDesk(userId: string): Promise<GrantDesk> {
  await ensureGrantTables();
  const sql = await getSql();
  const identity = await claimedIdentity(userId);
  const rows = await sql<GrantRow>`
    select id, user_id, ign, coins, stripe_session_id, status,
           created_at::text as created_at,
           delivered_at::text as delivered_at,
           attempted_at::text as attempted_at
    from nlo_coin_grants
    where user_id = ${userId}
    order by id desc
    limit 20
  `;
  const grants = rows.map(normalizeGrant);
  const open = grants.filter((g) => g.status === "pending" || g.status === "delivering");
  const done = grants.filter((g) => g.status === "delivered");
  return {
    claimedIgn: identity?.ign ?? null,
    claimedUuid: identity?.uuid ?? null,
    pendingCoins: open.reduce((sum, g) => sum + g.coins, 0),
    pendingCount: open.length,
    deliveredCoins: done.reduce((sum, g) => sum + g.coins, 0),
    grants,
  };
}

export async function listDeliverableGrants(): Promise<GrantRow[]> {
  await ensureGrantTables();
  const sql = await getSql();
  const rows = await sql.query<GrantRow>(
    `select ${GRANT_COLUMNS} from nlo_coin_grants where ${DELIVERABLE_WHERE} order by id asc limit 100`,
  );
  return rows.map(normalizeGrant);
}

export async function claimGrantForDelivery(id: number): Promise<GrantRow | null> {
  await ensureGrantTables();
  const sql = await getSql();
  const rows = await sql.query<GrantRow>(
    `update nlo_coin_grants
     set status = 'delivering', attempted_at = now()
     where id = $1 and ${DELIVERABLE_WHERE}
     returning ${GRANT_COLUMNS}`,
    [id],
  );
  return rows[0] ? normalizeGrant(rows[0]) : null;
}

export async function markGrantDelivered(id: number, ign?: string): Promise<GrantRow | null> {
  await ensureGrantTables();
  const sql = await getSql();
  const rows = await sql<GrantRow>`
    update nlo_coin_grants
    set status = 'delivered',
        delivered_at = coalesce(delivered_at, now()),
        ign = coalesce(${ign ?? null}, ign)
    where id = ${id}
      and status in ('pending', 'delivering', 'delivered')
    returning id, user_id, ign, coins, stripe_session_id, status,
              created_at::text as created_at,
              delivered_at::text as delivered_at,
              attempted_at::text as attempted_at
  `;
  return rows[0] ? normalizeGrant(rows[0]) : null;
}

export async function releaseGrant(id: number): Promise<GrantRow | null> {
  await ensureGrantTables();
  const sql = await getSql();
  const rows = await sql<GrantRow>`
    update nlo_coin_grants
    set status = 'pending'
    where id = ${id}
      and status = 'delivering'
    returning id, user_id, ign, coins, stripe_session_id, status,
              created_at::text as created_at,
              delivered_at::text as delivered_at,
              attempted_at::text as attempted_at
  `;
  return rows[0] ? normalizeGrant(rows[0]) : null;
}
