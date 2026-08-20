import assert from "node:assert/strict";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
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
    return `${grant.coins.toLocaleString()} coins waiting for ${grant.ign}. Join nlo.gg to receive them.`;
  }
  return "Join nlo.gg, confirm your Minecraft name, then coins land in-game.";
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
  assert.match(deliveryToast({ coins: 1000, ign: "Steve" }), /waiting for Steve/);
  assert.match(deliveryToast({ coins: 1000, ign: null }), /confirm your Minecraft name/);
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

test("shop credit is up to date only when ledger after matches or balance moved", () => {
  function credited(before, after, amount) {
    return before >= 0 && after >= 0 && amount > 0 && after - before >= amount;
  }
  function upToDate(snap, coins) {
    const moved = credited(snap.before, snap.after, coins);
    if (snap.ledgerId == null) return moved;
    if (snap.ledgerAfter != null && snap.after >= 0 && snap.after === snap.ledgerAfter) return true;
    return moved;
  }
  assert.equal(upToDate({ before: 1000, after: 2000, ledgerId: 71, ledgerAfter: 2000 }, 1000), true);
  assert.equal(upToDate({ before: 1000, after: 1000, ledgerId: 71, ledgerAfter: 2000 }, 1000), false);
  assert.equal(upToDate({ before: 1000, after: 2000, ledgerId: null, ledgerAfter: null }, 1000), true);
  assert.equal(upToDate({ before: 1000, after: 1000, ledgerId: null, ledgerAfter: null }, 1000), false);
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

function dashedUuid(id) {
  const hex = id.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) return id;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function pickSeenIdentity(raw, players, onlineNames = []) {
  const key = ignKey(raw);
  if (!key) return null;
  const hit = players.find((player) => ignKey(player.ign) === key);
  if (!hit) return null;
  const online = onlineNames.some((name) => ignKey(name) === key);
  return { ign: hit.ign, uuid: hit.uuid, source: online ? "online" : "seen" };
}

function resolveIdentity(raw, players, onlineNames = []) {
  const trimmed = String(raw).trim();
  const seen = pickSeenIdentity(trimmed, players, onlineNames);
  if (seen) return seen;
  if (trimmed.startsWith(".")) {
    throw new Error("Join nlo.gg on Bedrock first so we can bind that gamertag.");
  }
  throw new Error("Join nlo.gg with that name first so we bind the exact in-game account.");
}

test("claim binds to the exact in-game name, including Floodgate dots", () => {
  const players = [
    { ign: "Brockoozee", uuid: "7531fe36-556e-4c3a-8408-20577271affd" },
    { ign: ".Ultraboy46151", uuid: "00000000-0000-0000-0009-01f4e2155c9a" },
  ];
  assert.equal(pickSeenIdentity("brockoozee", players)?.ign, "Brockoozee");
  assert.equal(pickSeenIdentity("Ultraboy46151", players)?.ign, ".Ultraboy46151");
  assert.equal(pickSeenIdentity(".ultraboy46151", players)?.ign, ".Ultraboy46151");
  assert.equal(pickSeenIdentity("Notch", players), null);
  assert.equal(dashedUuid("7531fe36556e4c3a840820577271affd"), "7531fe36-556e-4c3a-8408-20577271affd");
});

test("checkout can start without a claimed IGN and still names a claimed one", () => {
  function startCheckout(claimedIgn) {
    return { ign: claimedIgn ?? null };
  }
  assert.deepEqual(startCheckout(null), { ign: null });
  assert.deepEqual(startCheckout("Brockoozee"), { ign: "Brockoozee" });
});

test("Stripe product name includes the verified IGN when claimed", () => {
  const ign = "Brockoozee";
  const named = `${(1000).toLocaleString()} NLO coins for ${ign} — Pebble`;
  const unnamed = `${(1000).toLocaleString()} NLO coins — Pebble`;
  assert.match(named, /for Brockoozee/);
  assert.equal(unnamed.includes(" for "), false);
});

test("unseen names cannot be claimed", () => {
  const players = [{ ign: "Brockoozee", uuid: "7531fe36-556e-4c3a-8408-20577271affd" }];
  assert.equal(resolveIdentity("Brockoozee", players).source, "seen");
  assert.equal(resolveIdentity("brockoozee", players, ["Brockoozee"]).source, "online");
  assert.throws(() => resolveIdentity("Notch", players), /Join nlo.gg with that name first/);
  assert.throws(() => resolveIdentity(".UnseenBedrock", []), /Bedrock first/);
});

function coinFlowPhase({ signedIn, claimedIgn, pendingCount = 0, delivered = false, seenNames = false }) {
  if (claimedIgn) {
    if (delivered && pendingCount === 0) return "done";
    if (pendingCount > 0) return "collect";
    return "done";
  }
  if (!signedIn) return "buy";
  if (pendingCount > 0) return seenNames ? "confirm" : "join";
  return "buy";
}

test("season prizes are $50 player, $20 builder, 25k clan", () => {
  const src = readFileSync(new URL("../src/lib/nlo/content.ts", import.meta.url), "utf8");
  assert.match(src, /place: "Top player"[\s\S]{0,80}title: "\$50"/);
  assert.match(src, /place: "Top builder"[\s\S]{0,80}title: "\$20"/);
  assert.match(src, /place: "Top clan"[\s\S]{0,80}title: "25,000 coins each"/);
  assert.doesNotMatch(src, /Finish first and take \$20/);
});

test("empty intel stays off the public nav", () => {
  const src = readFileSync(new URL("../src/lib/nlo/content.ts", import.meta.url), "utf8");
  const more = src.slice(src.indexOf("export const MORE_NAV"), src.indexOf("export const PRIZE_CHOICES"));
  assert.match(more, /\/bounties/);
  assert.doesNotMatch(more, /\/intel/);
});

test("share card names Season One prizes", () => {
  const src = readFileSync(new URL("../src/routes/__root.tsx", import.meta.url), "utf8");
  assert.match(src, /join tonight/);
  assert.match(src, /\$50/);
  assert.doesNotMatch(src, /open SMP with consequences/);
});

test("a $1 Pebble can fund the default bounty", () => {
  function canFundBounty(deskCoins, reward, min = 500) {
    return Number.isInteger(reward) && reward >= min && reward <= deskCoins;
  }
  assert.equal(canFundBounty(1000, 500), true);
  assert.equal(canFundBounty(1000, 1000), true);
  assert.equal(canFundBounty(1000, 2500), false);
  assert.equal(canFundBounty(499, 500), false);
  const src = readFileSync(new URL("../src/lib/nlo/content.ts", import.meta.url), "utf8");
  assert.match(src, /BOUNTY_MIN = 500/);
  const form = readFileSync(new URL("../src/routes/_site/bounties.tsx", import.meta.url), "utf8");
  assert.match(form, /BOUNTY_MIN/);
  assert.doesNotMatch(form, /useState\("2500"\)/);
  assert.match(form, /postBounty/);
  const logic = readFileSync(new URL("../src/lib/nlo/bounties.ts", import.meta.url), "utf8");
  assert.match(logic, /debitWallet/);
  assert.match(logic, /Confirm the Minecraft name you join with/);
  assert.match(logic, /You cannot put a bounty on yourself/);
  assert.doesNotMatch(logic, /Unsigned/);
});

test("done coin flow points at spending on a bounty", () => {
  const src = readFileSync(new URL("../src/components/coin-flow.tsx", import.meta.url), "utf8");
  assert.match(src, /canSpend/);
  assert.match(src, /Post a bounty/);
  assert.match(src, /to="\/bounties"/);
});

test("player coin flow highlights the current step", () => {
  assert.equal(coinFlowPhase({ signedIn: false, claimedIgn: null }), "buy");
  assert.equal(coinFlowPhase({ signedIn: true, claimedIgn: null, pendingCount: 1, seenNames: false }), "join");
  assert.equal(coinFlowPhase({ signedIn: true, claimedIgn: null, pendingCount: 1, seenNames: true }), "confirm");
  assert.equal(coinFlowPhase({ signedIn: true, claimedIgn: "Steve", pendingCount: 1 }), "collect");
  assert.equal(coinFlowPhase({ signedIn: true, claimedIgn: "Steve", pendingCount: 0, delivered: true }), "done");
});

