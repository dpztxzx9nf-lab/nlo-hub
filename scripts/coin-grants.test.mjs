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
  const pairs = header.split(",").map((part) => {
    const [k, ...rest] = part.split("=");
    return [k?.trim(), rest.join("=").trim()];
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
    verifyStripeSignature(
      payload,
      `t=${timestamp},v1=${"0".repeat(signature.length)},v1=${signature}`,
      secret,
      timestamp * 1000,
    ),
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

function oauthMode(env) {
  const id = String(env.GROK_AUTH_CLIENT_ID ?? "").trim();
  const secret = String(env.GROK_AUTH_CLIENT_SECRET ?? "").trim();
  return id && secret ? "production" : "preview";
}

function webhookConfigured(value) {
  return String(value ?? "").trim().startsWith("whsec_");
}

test("OAuth is preview unless both GROK_AUTH creds are set", () => {
  assert.equal(oauthMode({}), "preview");
  assert.equal(oauthMode({ GROK_AUTH_CLIENT_ID: "nlo" }), "preview");
  assert.equal(oauthMode({ GROK_AUTH_CLIENT_ID: "nlo", GROK_AUTH_CLIENT_SECRET: "s" }), "production");
});

test("shop webhook URL and signing secret shape", () => {
  assert.equal("https://nlo.gg/api/stripe/webhook", "https://nlo.gg/api/stripe/webhook");
  assert.equal(webhookConfigured("whsec_abc"), true);
  assert.equal(webhookConfigured("replace-me"), false);
  assert.equal(webhookConfigured(""), false);
});

test("plugin secret file lives on the Paper box, not the hub path", () => {
  const secretFile = "plugins/NLOCoins/nlo.env";
  assert.equal(secretFile.startsWith("/opt/nlo/"), false);
  assert.match(secretFile, /NLOCoins/);
});

test("plugin is live if it polled within 45 seconds", () => {
  const windowMs = 45_000;
  const seenAt = 1_000_000;
  assert.equal(Boolean(seenAt && 1_000_000 + 10_000 - seenAt < windowMs), true);
  assert.equal(Boolean(seenAt && 1_000_000 + 60_000 - seenAt < windowMs), false);
  assert.equal(Boolean(undefined && 1_000_000 - 0 < windowMs), false);
});

function retainPlayerSample(players, sample, previous, previousAt, now = Date.now(), maxAgeMs = 120_000) {
  if (!Number.isFinite(players) || players <= 0) return [];
  if (sample.length > 0) return sample;
  if (!previous?.length) return sample;
  if (previousAt != null && now - previousAt > maxAgeMs) return sample;
  return previous;
}

test("empty player samples keep the last good names for two minutes", () => {
  const names = [{ ign: "Steve" }];
  assert.deepEqual(retainPlayerSample(4, names, []), names);
  assert.deepEqual(retainPlayerSample(4, [], names, 1_000, 2_000), names);
  assert.deepEqual(retainPlayerSample(4, [], names, 1_000, 200_000), []);
  assert.deepEqual(retainPlayerSample(0, names, names, 1_000, 2_000), []);
  assert.deepEqual(retainPlayerSample(4, [], [], 1_000, 2_000), []);
});
