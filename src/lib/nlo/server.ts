import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { readOrders, readWallet } from "@/lib/nlo/wallet";
import { COIN_PACKS } from "@/lib/nlo/content";
import { createCoinCheckout, fulfillStripeSession, stripeConfigured } from "@/lib/nlo/stripe";
import { getWorldSnapshot, type SeenPlayer } from "@/lib/nlo/live";

export type { LiveStatus, SeenPlayer, WorldSnapshot } from "@/lib/nlo/live";
export type { OrderRow, Wallet } from "@/lib/nlo/wallet";

export type BountyRow = {
  id: number;
  target_ign: string;
  posted_by: string;
  reward: number;
  reason: string;
  status: string;
  posted_at: string;
};

export type IntelRow = {
  id: number;
  title: string;
  body: string;
  kind: string;
  posted_at: string;
};

const ignSchema = z
  .string()
  .trim()
  .regex(/^[\w.]{1,32}$/, "Use a Minecraft name.");

export const getSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  return getWorldSnapshot();
});

export const getLiveStatus = createServerFn({ method: "GET" }).handler(async () => {
  const snap = await getWorldSnapshot();
  return snap.status;
});

export const getRoster = createServerFn({ method: "GET" }).handler(async () => {
  const snap = await getWorldSnapshot();
  return snap.roster;
});

export const getPlayer = createServerFn({ method: "GET" })
  .validator((ign: string) => ignSchema.parse(ign))
  .handler(async ({ data: ign }): Promise<SeenPlayer | null> => {
    const snap = await getWorldSnapshot();
    const hit = snap.roster.find((p) => p.ign.toLowerCase() === ign.toLowerCase());
    if (hit) return hit;
    return {
      ign,
      uuid: null,
      first_seen: "",
      last_seen: "",
      seen_count: 0,
      online: false,
    };
  });

export const getBounties = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    return await sql<BountyRow>`
      select id, target_ign, posted_by, reward, reason, status, posted_at::text as posted_at
      from nlo_bounties
      order by case when status = 'open' then 0 else 1 end, reward desc, id desc
    `;
  } catch {
    return [];
  }
});

export const getIntel = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = await getSql();
    return await sql<IntelRow>`
      select id, title, body, kind, posted_at::text as posted_at
      from nlo_intel
      order by posted_at desc
    `;
  } catch {
    return [];
  }
});

export const getClaim = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ ign: string }>`
      select ign from nlo_claims where user_id = ${context.userId} limit 1
    `;
    return rows[0]?.ign ?? null;
  });

export const saveClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((ign: string) => ignSchema.parse(ign))
  .handler(async ({ context, data: ign }) => {
    const sql = await getSql();
    await sql`
      insert into nlo_claims (user_id, ign)
      values (${context.userId}, ${ign})
      on conflict (user_id) do update set ign = excluded.ign
    `;
    return ign;
  });

export const getWatch = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ ign: string }>`
      select ign from nlo_watch where user_id = ${context.userId} order by ign
    `;
  });

export const toggleWatch = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((ign: string) => ignSchema.parse(ign))
  .handler(async ({ context, data: ign }) => {
    const sql = await getSql();
    const existing = await sql<{ ign: string }>`
      select ign from nlo_watch where user_id = ${context.userId} and ign = ${ign}
    `;
    if (existing[0]) {
      await sql`delete from nlo_watch where user_id = ${context.userId} and ign = ${ign}`;
      return { watching: false };
    }
    await sql`insert into nlo_watch (user_id, ign) values (${context.userId}, ${ign})`;
    return { watching: true };
  });

export const postBounty = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { target: string; reward: number; reason: string }) =>
    z
      .object({
        target: ignSchema,
        reward: z.number().int().min(500).max(100000),
        reason: z.string().trim().min(8).max(180),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const claim = await sql<{ ign: string }>`
      select ign from nlo_claims where user_id = ${context.userId} limit 1
    `;
    const postedBy = claim[0]?.ign ?? "Unsigned";
    const rows = await sql<BountyRow>`
      insert into nlo_bounties (target_ign, posted_by, reward, reason, status)
      values (${data.target}, ${postedBy}, ${data.reward}, ${data.reason}, 'open')
      returning id, target_ign, posted_by, reward, reason, status, posted_at::text as posted_at
    `;
    return rows[0];
  });

export const getWallet = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      return await readWallet(context.userId);
    } catch {
      return { coins: 0 };
    }
  });

export const getOrders = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      return await readOrders(context.userId);
    } catch {
      return [];
    }
  });

export const getPayStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { card: stripeConfigured() };
});

export const startCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { packId: string; origin: string }) =>
    z
      .object({
        packId: z.enum(["pebble", "stack", "chest", "vault", "netherite"]),
        origin: z.string().url(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const pack = COIN_PACKS.find((p) => p.id === data.packId);
    if (!pack) throw new Error("Unknown pack.");
    const origin = new URL(data.origin);
    if (origin.protocol !== "https:" && origin.hostname !== "localhost" && origin.hostname !== "127.0.0.1") {
      throw new Error("Checkout needs a secure site.");
    }
    return createCoinCheckout({
      userId: context.userId,
      packId: pack.id,
      name: pack.name,
      coins: pack.coins,
      usd: pack.usd,
      origin: origin.origin,
    });
  });

export const fulfillCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((sessionId: string) => z.string().min(8).max(200).parse(sessionId))
  .handler(async ({ context, data: sessionId }) => {
    return fulfillStripeSession(sessionId, context.userId);
  });

