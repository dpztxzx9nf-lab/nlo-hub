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
