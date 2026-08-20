import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { readOrders, readOrderBySession, readWallet } from "@/lib/nlo/wallet";
import { COIN_PACKS } from "@/lib/nlo/content";
import { createCoinCheckout, fulfillStripeSession, readCheckoutSession, stripeConfigured, stripeLive, webhookConfigured } from "@/lib/nlo/stripe";
import { getWorldSnapshot, type SeenPlayer, type WorldSnapshot } from "@/lib/nlo/live";
import {
  claimedIdentity,
  claimIgnAvailable,
  pluginSeen,
  readGrantBySession,
  readGrantDesk,
  saveVerifiedClaim,
} from "@/lib/nlo/grants";
import { emptyGrantDesk, isValidIgn, type GrantDesk, type GrantStatus } from "@/lib/nlo/grant-shared";
import { resolveMinecraftIdentity, type SeenName } from "@/lib/nlo/ign-identity";

export type { LiveStatus, SeenPlayer, WorldSnapshot } from "@/lib/nlo/live";
export type { OrderRow, PaidPackResult, Wallet } from "@/lib/nlo/wallet";
export type { GrantDesk, GrantRow } from "@/lib/nlo/grant-shared";

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

export type ClaimableName = {
  ign: string;
  uuid: string | null;
  online: boolean;
};

export type ClaimPreview = {
  ign: string;
  uuid: string | null;
  online: boolean;
};

const ignSchema = z
  .string()
  .trim()
  .regex(/^[\w.]{1,32}$/, "Use a Minecraft name.");

function snapshotPlayers(snap: WorldSnapshot): { players: SeenName[]; onlineNames: string[] } {
  const players = [
    ...snap.onlineNames.map((name) => ({
      ign: name,
      uuid: snap.roster.find((row) => row.ign.toLowerCase() === name.toLowerCase())?.uuid ?? null,
    })),
    ...snap.roster.map((row) => ({ ign: row.ign, uuid: row.uuid })),
  ];
  return { players, onlineNames: snap.onlineNames };
}

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

export const getClaimableNames = createServerFn({ method: "GET" }).handler(async (): Promise<ClaimableName[]> => {
  const snap = await getWorldSnapshot();
  const online = new Set(snap.onlineNames.map((name) => name.toLowerCase()));
  const ranked = [...snap.roster].sort((a, b) => Number(b.online) - Number(a.online) || a.ign.localeCompare(b.ign));
  const extraOnline = snap.onlineNames
    .filter((name) => !ranked.some((row) => row.ign.toLowerCase() === name.toLowerCase()))
    .map((ign) => ({ ign, uuid: null, first_seen: "", last_seen: "", seen_count: 0, online: true }));
  return [...extraOnline, ...ranked].slice(0, 24).map((row) => ({
    ign: row.ign,
    uuid: row.uuid,
    online: Boolean(row.online) || online.has(row.ign.toLowerCase()),
  }));
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
    const identity = await claimedIdentity(context.userId);
    return identity?.ign ?? null;
  });

export const previewClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((ign: string) => ignSchema.parse(ign))
  .handler(async ({ context, data: ign }): Promise<ClaimPreview> => {
    if (!isValidIgn(ign)) throw new Error("Use a Minecraft name.");
    const snap = await getWorldSnapshot();
    const { players, onlineNames } = snapshotPlayers(snap);
    const identity = await resolveMinecraftIdentity(ign, players, onlineNames);
    const available = await claimIgnAvailable(context.userId, identity.ign);
    if (!available) throw new Error("That IGN is already claimed.");
    return {
      ign: identity.ign,
      uuid: identity.uuid,
      online: identity.source === "online",
    };
  });

export const saveClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((ign: string) => ignSchema.parse(ign))
  .handler(async ({ context, data: ign }) => {
    if (!isValidIgn(ign)) throw new Error("Use a Minecraft name.");
    const snap = await getWorldSnapshot();
    const { players, onlineNames } = snapshotPlayers(snap);
    const identity = await resolveMinecraftIdentity(ign, players, onlineNames);
    return saveVerifiedClaim(context.userId, identity);
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
  return {
    card: stripeConfigured(),
    live: stripeLive(),
    webhook: webhookConfigured(),
    plugin: pluginSeen(),
  };
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
    const identity = await claimedIdentity(context.userId);
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
      ign: identity?.ign ?? null,
      uuid: identity?.uuid ?? null,
    });
  });

export const fulfillCheckout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((sessionId: string) => z.string().min(8).max(200).parse(sessionId))
  .handler(async ({ context, data: sessionId }) => {
    return fulfillStripeSession(sessionId, context.userId);
  });

export type PaidReceipt = {
  sessionId: string;
  paid: boolean;
  pending: boolean;
  packId: string | null;
  packName: string | null;
  coins: number;
  usd: number;
  already: boolean;
  signedIn: boolean;
  claimedIgn: string | null;
  grantStatus: GrantStatus | null;
  plugin: boolean;
  error: string | null;
};

function emptyReceipt(sessionId: string, partial: Partial<PaidReceipt> = {}): PaidReceipt {
  return {
    sessionId,
    paid: false,
    pending: false,
    packId: null,
    packName: null,
    coins: 0,
    usd: 0,
    already: false,
    signedIn: false,
    claimedIgn: null,
    grantStatus: null,
    plugin: pluginSeen(),
    error: null,
    ...partial,
  };
}

function packFromId(packId: string | null | undefined) {
  if (!packId) return null;
  return COIN_PACKS.find((p) => p.id === packId) ?? null;
}

export const getPaidReceipt = createServerFn({ method: "GET" })
  .validator((sessionId: string) => z.string().min(8).max(200).parse(sessionId))
  .handler(async ({ data: sessionId }): Promise<PaidReceipt> => {
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    const user = await getSessionUser();
    const signedIn = Boolean(user);

    let checkout: Awaited<ReturnType<typeof readCheckoutSession>> | null = null;
    try {
      checkout = await readCheckoutSession(sessionId);
    } catch {
      checkout = null;
    }

    const order = await readOrderBySession(sessionId).catch(() => null);
    let grant = await readGrantBySession(sessionId).catch(() => null);
    const pack = packFromId(checkout?.packId ?? order?.pack_id ?? null);

    let claimedIgn: string | null = null;
    if (user) {
      const identity = await claimedIdentity(user.id).catch(() => null);
      claimedIgn = identity?.ign ?? null;
    }
    if (!claimedIgn) claimedIgn = grant?.ign ?? checkout?.ign ?? null;

    const ownerId = checkout?.userId ?? grant?.user_id ?? null;
    const isOwner = Boolean(user && ownerId && user.id === ownerId);
    let already = Boolean(order);
    let paid = Boolean(checkout?.paid || order);
    let pending = Boolean(checkout && !checkout.paid && !order);

    if (user && isOwner && paid && checkout) {
      try {
        const result = await fulfillStripeSession(sessionId, user.id);
        already = result.already;
        grant = result.grant;
        paid = true;
        pending = false;
        if (result.grant.ign) claimedIgn = result.grant.ign;
      } catch {
        // Webhook may already have credited the desk; keep showing the receipt.
      }
    }

    if (!checkout && !order) {
      return emptyReceipt(sessionId, {
        signedIn,
        claimedIgn,
        plugin: pluginSeen(),
        error: "Could not find that checkout. If you were charged, refresh — Stripe may still be confirming.",
      });
    }

    return {
      sessionId,
      paid,
      pending,
      packId: pack?.id ?? checkout?.packId ?? order?.pack_id ?? null,
      packName: pack?.name ?? null,
      coins: pack?.coins ?? Number(order?.coins ?? grant?.coins ?? 0),
      usd: pack?.usd ?? Number(order?.usd ?? 0),
      already,
      signedIn,
      claimedIgn,
      grantStatus: grant?.status ?? (paid ? "pending" : null),
      plugin: pluginSeen(),
      error: pending ? "Payment is still confirming. This page will catch up." : null,
    };
  });

export const getGrantDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<GrantDesk> => {
    try {
      return await readGrantDesk(context.userId);
    } catch {
      return emptyGrantDesk();
    }
  });
