import { n as COIN_PACKS } from "./content-BXrVujn_.mjs";
import { i as createServerFn, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { i as getSql, t as authMiddleware } from "./middleware-Dha2Hh6k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-DWl-BcdL.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
async function ensureWalletTables() {
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
function packById(id) {
	return COIN_PACKS.find((p) => p.id === id) ?? null;
}
async function readWallet(userId) {
	await ensureWalletTables();
	const rows = await (await getSql())`
    select coins from nlo_wallets where user_id = ${userId} limit 1
  `;
	return { coins: Number(rows[0]?.coins ?? 0) };
}
async function readOrders(userId) {
	await ensureWalletTables();
	return (await (await getSql())`
    select id, pack_id, coins, usd, status, created_at::text as created_at
    from nlo_orders
    where user_id = ${userId}
    order by id desc
    limit 20
  `).map((r) => ({
		id: Number(r.id),
		pack_id: String(r.pack_id),
		coins: Number(r.coins),
		usd: Number(r.usd),
		status: String(r.status),
		created_at: String(r.created_at)
	}));
}
async function grantPaidPack(userId, packId, stripeSessionId) {
	const pack = packById(packId);
	if (!pack) throw new Error("Unknown pack.");
	await ensureWalletTables();
	const sql = await getSql();
	const existing = await sql`
    select id, pack_id, coins, usd, status, created_at::text as created_at
    from nlo_orders
    where stripe_session_id = ${stripeSessionId}
    limit 1
  `;
	if (existing[0]) return {
		wallet: await readWallet(userId),
		order: normalizeOrder(existing[0]),
		already: true
	};
	await sql`
    insert into nlo_wallets (user_id, coins, updated_at)
    values (${userId}, ${pack.coins}, now())
    on conflict (user_id) do update set
      coins = nlo_wallets.coins + excluded.coins,
      updated_at = now()
  `;
	const order = await sql`
    insert into nlo_orders (user_id, pack_id, coins, usd, status, stripe_session_id)
    values (${userId}, ${pack.id}, ${pack.coins}, ${pack.usd}, 'paid', ${stripeSessionId})
    returning id, pack_id, coins, usd, status, created_at::text as created_at
  `;
	return {
		wallet: await readWallet(userId),
		order: normalizeOrder(order[0]),
		already: false
	};
}
function normalizeOrder(r) {
	return {
		id: Number(r.id),
		pack_id: String(r.pack_id),
		coins: Number(r.coins),
		usd: Number(r.usd),
		status: String(r.status),
		created_at: String(r.created_at)
	};
}
function secret() {
	return process.env.STRIPE_SECRET_KEY?.trim() || "";
}
function stripeConfigured() {
	return Boolean(secret());
}
async function stripePost(path, body) {
	const key = secret();
	if (!key) throw new Error("Card checkout is not connected.");
	const res = await fetch(`https://api.stripe.com/v1/${path}`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${key}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams(body)
	});
	const data = await res.json();
	if (!res.ok) {
		const err = data.error;
		throw new Error(err?.message || "Stripe request failed.");
	}
	return data;
}
async function stripeGet(path) {
	const key = secret();
	if (!key) throw new Error("Card checkout is not connected.");
	const res = await fetch(`https://api.stripe.com/v1/${path}`, { headers: { Authorization: `Bearer ${key}` } });
	const data = await res.json();
	if (!res.ok) {
		const err = data.error;
		throw new Error(err?.message || "Stripe request failed.");
	}
	return data;
}
async function createCoinCheckout(input) {
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
		"metadata[packId]": input.packId
	});
	const url = typeof session.url === "string" ? session.url : "";
	const id = typeof session.id === "string" ? session.id : "";
	if (!url || !id) throw new Error("Checkout did not start.");
	return {
		url,
		id
	};
}
async function fulfillStripeSession(sessionId, userId) {
	if (!sessionId.startsWith("cs_")) throw new Error("Invalid checkout.");
	const session = await stripeGet(`checkout/sessions/${encodeURIComponent(sessionId)}`);
	if (!(session.payment_status === "paid" || session.status === "complete")) throw new Error("Payment is not complete.");
	const meta = session.metadata ?? {};
	if (meta.userId && meta.userId !== userId) throw new Error("That checkout belongs to another desk.");
	const packId = meta.packId;
	if (!packId) throw new Error("Checkout is missing a pack.");
	return grantPaidPack(userId, packId, sessionId);
}
var CACHE_MS = 2e4;
var globalRef = globalThis;
globalRef.__nloSnapshot__ = void 0;
function emptyStatus() {
	return {
		online: false,
		players: 0,
		max: 16,
		version: "26.2",
		motd: null,
		checked: false
	};
}
async function pingOne(host) {
	const res = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`, {
		signal: AbortSignal.timeout(8e3),
		headers: { Accept: "application/json" }
	});
	if (!res.ok) throw new Error("status " + res.status);
	const data = await res.json();
	const sample = (data.players?.list ?? []).map((p) => {
		const ign = (p.name_clean || p.name_raw || "").trim();
		if (!ign) return null;
		return {
			ign,
			uuid: p.uuid ?? null
		};
	}).filter((p) => Boolean(p));
	return {
		status: {
			online: Boolean(data.online),
			players: data.players?.online ?? sample.length,
			max: data.players?.max ?? 16,
			version: data.version?.name_clean ?? "26.2",
			motd: data.motd?.clean?.replace(/\s+/g, " ").trim() ?? null,
			checked: true
		},
		sample
	};
}
async function pingJava() {
	let lastErr;
	for (const host of ["nlo.gg", "5.78.90.11"]) {
		try {
			return await pingOne(host);
		} catch (e) {
			lastErr = e;
		}
	}
	throw lastErr instanceof Error ? lastErr : new Error("status");
}
async function ensureSeenTable() {
	await (await getSql()).query(`
    create table if not exists nlo_seen (
      ign text primary key,
      uuid text,
      first_seen timestamptz not null default now(),
      last_seen timestamptz not null default now(),
      seen_count integer not null default 1
    )
  `);
}
async function persistSample(sample) {
	await ensureSeenTable();
	if (sample.length === 0) return;
	const sql = await getSql();
	for (const p of sample) await sql`
      insert into nlo_seen (ign, uuid, first_seen, last_seen, seen_count)
      values (${p.ign}, ${p.uuid}, now(), now(), 1)
      on conflict (ign) do update set
        uuid = coalesce(excluded.uuid, nlo_seen.uuid),
        last_seen = now(),
        seen_count = nlo_seen.seen_count + case
          when nlo_seen.last_seen < now() - interval '5 minutes' then 1
          else 0
        end
    `;
}
async function loadRoster(onlineNames) {
	await ensureSeenTable();
	return (await (await getSql())`
    select ign, uuid, first_seen::text as first_seen, last_seen::text as last_seen, seen_count
    from nlo_seen
    order by last_seen desc, ign asc
  `).map((r) => ({
		ign: String(r.ign),
		uuid: r.uuid ? String(r.uuid) : null,
		first_seen: String(r.first_seen ?? ""),
		last_seen: String(r.last_seen ?? ""),
		seen_count: Number(r.seen_count) || 0,
		online: onlineNames.has(String(r.ign).toLowerCase())
	}));
}
async function getWorldSnapshot() {
	const empty = {
		status: emptyStatus(),
		onlineNames: [],
		roster: []
	};
	try {
		const cached = globalRef.__nloSnapshot__;
		if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;
		let status = emptyStatus();
		let sample = [];
		try {
			const ping = await pingJava();
			status = ping.status;
			sample = ping.sample;
			globalRef.__nloLastGood__ = {
				at: Date.now(),
				status,
				sample
			};
			await persistSample(sample);
		} catch {
			const last = globalRef.__nloLastGood__;
			if (last && Date.now() - last.at < 6e5) {
				status = last.status;
				sample = last.sample;
			} else {
				status = {
					...emptyStatus(),
					checked: false
				};
			}
		}
		const onlineNames = new Set(sample.map((p) => p.ign.toLowerCase()));
		let roster = [];
		try {
			roster = await loadRoster(onlineNames);
		} catch {
			roster = sample.map((p) => ({
				ign: p.ign,
				uuid: p.uuid,
				first_seen: "",
				last_seen: "",
				seen_count: 1,
				online: true
			}));
		}
		const value = {
			status: {
				online: Boolean(status.online),
				players: Number(status.players) || 0,
				max: Number(status.max) || 16,
				version: status.version ? String(status.version) : null,
				motd: cleanMotd(status.motd),
				checked: Boolean(status.checked)
			},
			onlineNames: sample.map((p) => String(p.ign)),
			roster
		};
		globalRef.__nloSnapshot__ = {
			at: Date.now(),
			value
		};
		return value;
	} catch {
		return empty;
	}
}
function cleanMotd(raw) {
	if (!raw) return null;
	const cleaned = raw.replace(/[§]./g, "").replace(/I{3,}/gi, " ").replace(/\s+/g, " ").trim();
	return cleaned.length > 8 ? cleaned : null;
}
var ignSchema = string().trim().regex(/^[\w.]{1,32}$/, "Use a Minecraft name.");
var getSnapshot_createServerFn_handler = createServerRpc({
	id: "4eed68aa379abfca69786dea1beb9ae122656a444ed5175137d1a08721d7b4f1",
	name: "getSnapshot",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getSnapshot.__executeServer(opts));
var getSnapshot = createServerFn({ method: "GET" }).handler(getSnapshot_createServerFn_handler, async () => {
	return getWorldSnapshot();
});
var getLiveStatus_createServerFn_handler = createServerRpc({
	id: "f02beaa5e6161ec51999610e3bd8fb9f2f36ec46f9fa625d9e66426b875aa346",
	name: "getLiveStatus",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getLiveStatus.__executeServer(opts));
var getLiveStatus = createServerFn({ method: "GET" }).handler(getLiveStatus_createServerFn_handler, async () => {
	return (await getWorldSnapshot()).status;
});
var getRoster_createServerFn_handler = createServerRpc({
	id: "ec094ce064cd56398ae3a3ecb197964648965a49a8e58a8e817bc488bdc72884",
	name: "getRoster",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getRoster.__executeServer(opts));
var getRoster = createServerFn({ method: "GET" }).handler(getRoster_createServerFn_handler, async () => {
	return (await getWorldSnapshot()).roster;
});
var getPlayer_createServerFn_handler = createServerRpc({
	id: "53a9d3160779fba9cf6df27e59fc46e0824b7cc2a57bbc5be7f1b48e1eb3a9b7",
	name: "getPlayer",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getPlayer.__executeServer(opts));
var getPlayer = createServerFn({ method: "GET" }).validator((ign) => ignSchema.parse(ign)).handler(getPlayer_createServerFn_handler, async ({ data: ign }) => {
	const hit = (await getWorldSnapshot()).roster.find((p) => p.ign.toLowerCase() === ign.toLowerCase());
	if (hit) return hit;
	return {
		ign,
		uuid: null,
		first_seen: "",
		last_seen: "",
		seen_count: 0,
		online: false
	};
});
var getBounties_createServerFn_handler = createServerRpc({
	id: "958df364c415ef4426fdc69c1da6b87b4e1f915544c38b818559f62f14dbbb17",
	name: "getBounties",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getBounties.__executeServer(opts));
var getBounties = createServerFn({ method: "GET" }).handler(getBounties_createServerFn_handler, async () => {
	try {
		return await (await getSql())`
      select id, target_ign, posted_by, reward, reason, status, posted_at::text as posted_at
      from nlo_bounties
      order by case when status = 'open' then 0 else 1 end, reward desc, id desc
    `;
	} catch {
		return [];
	}
});
var getIntel_createServerFn_handler = createServerRpc({
	id: "407e3fafe8584ec86151eb25971513191ed85917079f1bacc7c3b0abd8b0cbdc",
	name: "getIntel",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getIntel.__executeServer(opts));
var getIntel = createServerFn({ method: "GET" }).handler(getIntel_createServerFn_handler, async () => {
	try {
		return await (await getSql())`
      select id, title, body, kind, posted_at::text as posted_at
      from nlo_intel
      order by posted_at desc
    `;
	} catch {
		return [];
	}
});
var getClaim_createServerFn_handler = createServerRpc({
	id: "91cb7ceaf109dc1b37f5bff787a73a9973bbad3b33b82f09bf4507b8a70bec5e",
	name: "getClaim",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getClaim.__executeServer(opts));
var getClaim = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getClaim_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select ign from nlo_claims where user_id = ${context.userId} limit 1
    `)[0]?.ign ?? null;
});
var saveClaim_createServerFn_handler = createServerRpc({
	id: "cbf12b55b7d13165cedab7855274d835f61a15b65df3ce0278f6b60930088ea8",
	name: "saveClaim",
	filename: "src/lib/nlo/server.ts"
}, (opts) => saveClaim.__executeServer(opts));
var saveClaim = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((ign) => ignSchema.parse(ign)).handler(saveClaim_createServerFn_handler, async ({ context, data: ign }) => {
	await (await getSql())`
      insert into nlo_claims (user_id, ign)
      values (${context.userId}, ${ign})
      on conflict (user_id) do update set ign = excluded.ign
    `;
	return ign;
});
var getWatch_createServerFn_handler = createServerRpc({
	id: "1a51abf499b27c5773307a4f692a24644d42069cb16da313c016c5e3d3496a60",
	name: "getWatch",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getWatch.__executeServer(opts));
var getWatch = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getWatch_createServerFn_handler, async ({ context }) => {
	return (await getSql())`
      select ign from nlo_watch where user_id = ${context.userId} order by ign
    `;
});
var toggleWatch_createServerFn_handler = createServerRpc({
	id: "2157d225b5bedf9c9c983cd188339160e63af12d5d6a92356cc70d5a57ee2e09",
	name: "toggleWatch",
	filename: "src/lib/nlo/server.ts"
}, (opts) => toggleWatch.__executeServer(opts));
var toggleWatch = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((ign) => ignSchema.parse(ign)).handler(toggleWatch_createServerFn_handler, async ({ context, data: ign }) => {
	const sql = await getSql();
	if ((await sql`
      select ign from nlo_watch where user_id = ${context.userId} and ign = ${ign}
    `)[0]) {
		await sql`delete from nlo_watch where user_id = ${context.userId} and ign = ${ign}`;
		return { watching: false };
	}
	await sql`insert into nlo_watch (user_id, ign) values (${context.userId}, ${ign})`;
	return { watching: true };
});
var postBounty_createServerFn_handler = createServerRpc({
	id: "146d9a267c018791511b7c8dad30e1d2bcdfc90e07be7fcf5fa352190bbd62b0",
	name: "postBounty",
	filename: "src/lib/nlo/server.ts"
}, (opts) => postBounty.__executeServer(opts));
var postBounty = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	target: ignSchema,
	reward: number().int().min(500).max(1e5),
	reason: string().trim().min(8).max(180)
}).parse(input)).handler(postBounty_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const postedBy = (await sql`
      select ign from nlo_claims where user_id = ${context.userId} limit 1
    `)[0]?.ign ?? "Unsigned";
	return (await sql`
      insert into nlo_bounties (target_ign, posted_by, reward, reason, status)
      values (${data.target}, ${postedBy}, ${data.reward}, ${data.reason}, 'open')
      returning id, target_ign, posted_by, reward, reason, status, posted_at::text as posted_at
    `)[0];
});
var getWallet_createServerFn_handler = createServerRpc({
	id: "8d6f0d908fae906d33f316d1623db86650393eefdac172352ad0c837485d230a",
	name: "getWallet",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getWallet.__executeServer(opts));
var getWallet = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getWallet_createServerFn_handler, async ({ context }) => {
	try {
		return await readWallet(context.userId);
	} catch {
		return { coins: 0 };
	}
});
var getOrders_createServerFn_handler = createServerRpc({
	id: "2958c457cc804b7e91664ba0e4da6a3a17714e9250f9f36a241a308f4a7c3a7d",
	name: "getOrders",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getOrders.__executeServer(opts));
var getOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getOrders_createServerFn_handler, async ({ context }) => {
	try {
		return await readOrders(context.userId);
	} catch {
		return [];
	}
});
var getPayStatus_createServerFn_handler = createServerRpc({
	id: "47b2a025de66f864ff8eedebc98005e0c8bebe257a2d21a09aee96ca760972b1",
	name: "getPayStatus",
	filename: "src/lib/nlo/server.ts"
}, (opts) => getPayStatus.__executeServer(opts));
var getPayStatus = createServerFn({ method: "GET" }).handler(getPayStatus_createServerFn_handler, async () => {
	return { card: stripeConfigured() };
});
var startCheckout_createServerFn_handler = createServerRpc({
	id: "04d2f5681fb63810f06b79da32b0ba9be92d3533c0f6697e751a5cf81ff1691c",
	name: "startCheckout",
	filename: "src/lib/nlo/server.ts"
}, (opts) => startCheckout.__executeServer(opts));
var startCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	packId: _enum([
		"pebble",
		"stack",
		"chest",
		"vault",
		"netherite"
	]),
	origin: string().url()
}).parse(input)).handler(startCheckout_createServerFn_handler, async ({ context, data }) => {
	const pack = COIN_PACKS.find((p) => p.id === data.packId);
	if (!pack) throw new Error("Unknown pack.");
	const origin = new URL(data.origin);
	if (origin.protocol !== "https:" && origin.hostname !== "localhost" && origin.hostname !== "127.0.0.1") throw new Error("Checkout needs a secure site.");
	return createCoinCheckout({
		userId: context.userId,
		packId: pack.id,
		name: pack.name,
		coins: pack.coins,
		usd: pack.usd,
		origin: origin.origin
	});
});
var fulfillCheckout_createServerFn_handler = createServerRpc({
	id: "aae6bf4b8954f757aac49bfa5492a35e29244fdcfb93e3f6ebb2e3fb00b4460f",
	name: "fulfillCheckout",
	filename: "src/lib/nlo/server.ts"
}, (opts) => fulfillCheckout.__executeServer(opts));
var fulfillCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((sessionId) => string().min(8).max(200).parse(sessionId)).handler(fulfillCheckout_createServerFn_handler, async ({ context, data: sessionId }) => {
	return fulfillStripeSession(sessionId, context.userId);
});
//#endregion
export { fulfillCheckout_createServerFn_handler, getBounties_createServerFn_handler, getClaim_createServerFn_handler, getIntel_createServerFn_handler, getLiveStatus_createServerFn_handler, getOrders_createServerFn_handler, getPayStatus_createServerFn_handler, getPlayer_createServerFn_handler, getRoster_createServerFn_handler, getSnapshot_createServerFn_handler, getWallet_createServerFn_handler, getWatch_createServerFn_handler, postBounty_createServerFn_handler, saveClaim_createServerFn_handler, startCheckout_createServerFn_handler, toggleWatch_createServerFn_handler };
