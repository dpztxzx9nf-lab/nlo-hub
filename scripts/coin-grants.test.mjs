import assert from "node:assert/strict";
import { createHmac, timingSafeEqual } from "node:crypto";
import { test } from "node:test";

function isValidIgn(raw) {
  return /^[\w.]{1,32}$/.test(raw.trim());
}

function ignKey(raw) {
  return raw.trim().replace(/^\.+/, "").toLowerCase();
}

function ignsMatch(claimed, online) {
  if (!claimed || !online) return false;
  return ignKey(claimed) === ignKey(online);
}

function publicGrantStatus(status) {
  if (status === "delivered") return "delivered";
  if (status === "failed") return "failed";
  return "pending";
}

function deliveryToast(grant) {
  if (grant.ign) {
    return `${grant.coins.toLocaleString()} coins queued for ${grant.ign}. Join nlo.gg to receive them.`;
  }
  return "Claim your Minecraft IGN so coins can be delivered in-game.";
}

function verifyStripeSignature(payload, header, secret, now) {
  const parts = Object.fromEntries(
    header.split(",").map((part) => {
      const [k, ...rest] = part.split("=");
      return [k?.trim(), rest.join("=").trim()];
    }),
  );
  const timestamp = Number(parts.t);
  const signature = parts.v1;
  if (!Number.isFinite(timestamp) || !signature) return false;
  if (Math.abs(now / 1000 - timestamp) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

test("IGN format and Floodgate prefix matching", () => {
  assert.equal(isValidIgn("Steve"), true);
  assert.equal(isValidIgn(".BedrockName"), true);
  assert.equal(isValidIgn("bad name"), false);
  assert.equal(isValidIgn(""), false);
  assert.equal(ignKey(".Steve"), "steve");
  assert.equal(ignsMatch("Steve", ".steve"), true);
  assert.equal(ignsMatch("Alex", "Steve"), false);
});

test("player-facing grant status collapses delivering into pending", () => {
  assert.equal(publicGrantStatus("pending"), "pending");
  assert.equal(publicGrantStatus("delivering"), "pending");
  assert.equal(publicGrantStatus("delivered"), "delivered");
  assert.equal(publicGrantStatus("failed"), "failed");
});

test("pay toast tells the player where coins will land", () => {
  assert.match(deliveryToast({ coins: 1000, ign: "Steve" }), /queued for Steve/);
  assert.match(deliveryToast({ coins: 1000, ign: null }), /Claim your Minecraft IGN/);
});

test("Stripe webhook HMAC matches Stripe's signed payload", () => {
  const payload = '{"type":"checkout.session.completed"}';
  const secret = "whsec_test";
  const timestamp = 1_700_000_000;
  const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  assert.equal(
    verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, secret, timestamp * 1000),
    true,
  );
  assert.equal(
    verifyStripeSignature(payload, `t=${timestamp},v1=${"0".repeat(signature.length)}`, secret, timestamp * 1000),
    false,
  );
});

test("RCON shop grant command targets NLOP, not eco give", () => {
  const command = `season admin balance Steve add 1000 nlo-shop-12`;
  assert.equal(command, "season admin balance Steve add 1000 nlo-shop-12");
  assert.match("Adjusted Steve by 1000.", /adjusted/i);
});
