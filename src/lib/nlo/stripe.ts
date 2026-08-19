import { createHmac, timingSafeEqual } from "node:crypto";
import { grantPaidPack } from "@/lib/nlo/wallet";

function secret() {
  return process.env.STRIPE_SECRET_KEY?.trim() || "";
}

export function stripeConfigured() {
  return Boolean(secret());
}

async function stripePost(path: string, body: Record<string, string>) {
  const key = secret();
  if (!key) throw new Error("Card checkout is not connected.");
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = data.error as { message?: string } | undefined;
    throw new Error(err?.message || "Stripe request failed.");
  }
  return data;
}

async function stripeGet(path: string) {
  const key = secret();
  if (!key) throw new Error("Card checkout is not connected.");
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    const err = data.error as { message?: string } | undefined;
    throw new Error(err?.message || "Stripe request failed.");
  }
  return data;
}

export async function createCoinCheckout(input: {
  userId: string;
  packId: string;
  name: string;
  coins: number;
  usd: number;
  origin: string;
}) {
  const session = await stripePost("checkout/sessions", {
    mode: "payment",
    "payment_method_types[0]": "card",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(input.usd * 100),
    "line_items[0][price_data][product_data][name]": `${input.coins.toLocaleString()} NLO coins — ${input.name}`,
    success_url: `${input.origin}/shop?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/shop?cancel=1`,
    client_reference_id: input.userId,
    "metadata[userId]": input.userId,
    "metadata[packId]": input.packId,
  });
  const url = typeof session.url === "string" ? session.url : "";
  const id = typeof session.id === "string" ? session.id : "";
  if (!url || !id) throw new Error("Checkout did not start.");
  return { url, id };
}

export async function fulfillStripeSession(sessionId: string, userId: string) {
  if (!sessionId.startsWith("cs_")) throw new Error("Invalid checkout.");
  const session = await stripeGet(`checkout/sessions/${encodeURIComponent(sessionId)}`);
  const paid = session.payment_status === "paid" || session.status === "complete";
  if (!paid) throw new Error("Payment is not complete.");
  const meta = (session.metadata ?? {}) as { userId?: string; packId?: string };
  if (meta.userId && meta.userId !== userId) throw new Error("That checkout belongs to another desk.");
  const packId = meta.packId;
  if (!packId) throw new Error("Checkout is missing a pack.");
  return grantPaidPack(userId, packId, sessionId);
}

export function webhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
}

export function verifyStripeSignature(payload: string, header: string, secret: string, now = Date.now()): boolean {
  if (!payload || !header || !secret) return false;
  const pairs = header.split(",").map((part) => {
    const [k, ...rest] = part.split("=");
    return [k?.trim(), rest.join("=").trim()] as const;
  });
  const timestamp = Number(pairs.find(([k]) => k === "t")?.[1]);
  const signatures = pairs.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(now / 1000 - timestamp) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const expectedBuf = Buffer.from(expected);
  return signatures.some((signature) => {
    const a = Buffer.from(signature);
    return a.length === expectedBuf.length && timingSafeEqual(a, expectedBuf);
  });
}

export async function fulfillStripeWebhook(payload: string, signature: string) {
  const secret = webhookSecret();
  if (!secret) throw new Error("Stripe webhook is not configured.");
  if (!verifyStripeSignature(payload, signature, secret)) {
    throw new Error("Invalid Stripe signature.");
  }
  const event = JSON.parse(payload) as {
    type?: string;
    data?: { object?: Record<string, unknown> };
  };
  if (event.type !== "checkout.session.completed") {
    return { ignored: true as const };
  }
  const session = event.data?.object ?? {};
  const sessionId = typeof session.id === "string" ? session.id : "";
  const paid = session.payment_status === "paid" || session.status === "complete";
  const meta = (session.metadata ?? {}) as { userId?: string; packId?: string };
  if (!sessionId.startsWith("cs_") || !paid || !meta.userId || !meta.packId) {
    return { ignored: true as const };
  }
  const result = await grantPaidPack(meta.userId, meta.packId, sessionId);
  return { ignored: false as const, ...result };
}
