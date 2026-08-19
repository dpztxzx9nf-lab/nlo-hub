import { getSql } from "@/lib/db";
import { COIN_PACKS } from "@/lib/nlo/content";
import { enqueuePaidGrant, type GrantRow } from "@/lib/nlo/grants";

export type Wallet = {
  coins: number;
};

export type OrderRow = {
  id: number;
  pack_id: string;
  coins: number;
  usd: number;
  status: string;
  created_at: string;
};

export async function ensureWalletTables() {
  const sql = await getSql();
  await sql.query(`
    create table if not exists nlo_wallets (
      user_id text primary key,
      coins integer not null default 0,
      updated_at timestamptz not null default now()
    )
  `);
  await sql.query(`
    create table if not exists nlo_orders (
      id serial primary key,
      user_id text not null,
      pack_id text not null,
      coins integer not null,
      usd integer not null,
      status text not null default 'paid',
      stripe_session_id text unique,
      created_at timestamptz not null default now()
    )
  `);
  await sql.query(`alter table nlo_orders add column if not exists stripe_session_id text`);
  await sql.query(`
    create unique index if not exists nlo_orders_stripe_session
    on nlo_orders (stripe_session_id)
    where stripe_session_id is not null
  `);
}

export function packById(id: string) {
  return COIN_PACKS.find((p) => p.id === id) ?? null;
}

export async function readWallet(userId: string): Promise<Wallet> {
  await ensureWalletTables();
  const sql = await getSql();
  const rows = await sql<{ coins: number }>`
    select coins from nlo_wallets where user_id = ${userId} limit 1
  `;
  return { coins: Number(rows[0]?.coins ?? 0) };
}

export async function readOrders(userId: string): Promise<OrderRow[]> {
  await ensureWalletTables();
  const sql = await getSql();
  const rows = await sql<OrderRow>`
    select id, pack_id, coins, usd, status, created_at::text as created_at
    from nlo_orders
    where user_id = ${userId}
    order by id desc
    limit 20
  `;
  return rows.map((r) => ({
    id: Number(r.id),
    pack_id: String(r.pack_id),
    coins: Number(r.coins),
    usd: Number(r.usd),
    status: String(r.status),
    created_at: String(r.created_at),
  }));
}

export async function grantPaidPack(userId: string, packId: string, stripeSessionId: string) {
  const pack = packById(packId);
  if (!pack) throw new Error("Unknown pack.");
  await ensureWalletTables();
  const sql = await getSql();
  const existing = await sql<OrderRow>`
    select id, pack_id, coins, usd, status, created_at::text as created_at
    from nlo_orders
    where stripe_session_id = ${stripeSessionId}
    limit 1
  `;
  if (existing[0]) {
    const grant = await enqueuePaidGrant({
      userId,
      coins: Number(existing[0].coins) || pack.coins,
      stripeSessionId,
    });
    return {
      wallet: await readWallet(userId),
      order: normalizeOrder(existing[0]),
      already: true,
      grant,
    };
  }
  let inserted: OrderRow | undefined;
  try {
    const rows = await sql<OrderRow>`
      insert into nlo_orders (user_id, pack_id, coins, usd, status, stripe_session_id)
      values (${userId}, ${pack.id}, ${pack.coins}, ${pack.usd}, 'paid', ${stripeSessionId})
      returning id, pack_id, coins, usd, status, created_at::text as created_at
    `;
    inserted = rows[0];
  } catch {
    inserted = undefined;
  }
  if (!inserted) {
    const raced = await sql<OrderRow>`
      select id, pack_id, coins, usd, status, created_at::text as created_at
      from nlo_orders
      where stripe_session_id = ${stripeSessionId}
      limit 1
    `;
    if (!raced[0]) throw new Error("Could not record the paid pack.");
    const grant = await enqueuePaidGrant({
      userId,
      coins: Number(raced[0].coins) || pack.coins,
      stripeSessionId,
    });
    return {
      wallet: await readWallet(userId),
      order: normalizeOrder(raced[0]),
      already: true,
      grant,
    };
  }
  await sql`
    insert into nlo_wallets (user_id, coins, updated_at)
    values (${userId}, ${pack.coins}, now())
    on conflict (user_id) do update set
      coins = nlo_wallets.coins + excluded.coins,
      updated_at = now()
  `;
  const grant = await enqueuePaidGrant({
    userId,
    coins: pack.coins,
    stripeSessionId,
  });
  return {
    wallet: await readWallet(userId),
    order: normalizeOrder(inserted),
    already: false,
    grant,
  };
}

export type PaidPackResult = {
  wallet: Wallet;
  order: OrderRow;
  already: boolean;
  grant: GrantRow;
};

function normalizeOrder(r: OrderRow): OrderRow {
  return {
    id: Number(r.id),
    pack_id: String(r.pack_id),
    coins: Number(r.coins),
    usd: Number(r.usd),
    status: String(r.status),
    created_at: String(r.created_at),
  };
}
