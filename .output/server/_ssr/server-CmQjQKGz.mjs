import { i as createServerFn, o as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { D as _enum, F as object, P as number, R as string } from "../_libs/@better-auth/core+[...].mjs";
import { t as authMiddleware } from "./middleware-Dha2Hh6k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-CmQjQKGz.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var ignSchema = string().trim().regex(/^[\w.]{1,32}$/, "Use a Minecraft name.");
var getSnapshot = createServerFn({ method: "GET" }).handler(createSsrRpc("4eed68aa379abfca69786dea1beb9ae122656a444ed5175137d1a08721d7b4f1"));
var getLiveStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("f02beaa5e6161ec51999610e3bd8fb9f2f36ec46f9fa625d9e66426b875aa346"));
var getRoster = createServerFn({ method: "GET" }).handler(createSsrRpc("ec094ce064cd56398ae3a3ecb197964648965a49a8e58a8e817bc488bdc72884"));
var getPlayer = createServerFn({ method: "GET" }).validator((ign) => ignSchema.parse(ign)).handler(createSsrRpc("53a9d3160779fba9cf6df27e59fc46e0824b7cc2a57bbc5be7f1b48e1eb3a9b7"));
var getBounties = createServerFn({ method: "GET" }).handler(createSsrRpc("958df364c415ef4426fdc69c1da6b87b4e1f915544c38b818559f62f14dbbb17"));
var getIntel = createServerFn({ method: "GET" }).handler(createSsrRpc("407e3fafe8584ec86151eb25971513191ed85917079f1bacc7c3b0abd8b0cbdc"));
var getClaim = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("91cb7ceaf109dc1b37f5bff787a73a9973bbad3b33b82f09bf4507b8a70bec5e"));
var saveClaim = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((ign) => ignSchema.parse(ign)).handler(createSsrRpc("cbf12b55b7d13165cedab7855274d835f61a15b65df3ce0278f6b60930088ea8"));
var getWatch = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("1a51abf499b27c5773307a4f692a24644d42069cb16da313c016c5e3d3496a60"));
var toggleWatch = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((ign) => ignSchema.parse(ign)).handler(createSsrRpc("2157d225b5bedf9c9c983cd188339160e63af12d5d6a92356cc70d5a57ee2e09"));
var postBounty = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	target: ignSchema,
	reward: number().int().min(500).max(1e5),
	reason: string().trim().min(8).max(180)
}).parse(input)).handler(createSsrRpc("146d9a267c018791511b7c8dad30e1d2bcdfc90e07be7fcf5fa352190bbd62b0"));
var getWallet = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8d6f0d908fae906d33f316d1623db86650393eefdac172352ad0c837485d230a"));
var getOrders = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2958c457cc804b7e91664ba0e4da6a3a17714e9250f9f36a241a308f4a7c3a7d"));
var getPayStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("47b2a025de66f864ff8eedebc98005e0c8bebe257a2d21a09aee96ca760972b1"));
var startCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => object({
	packId: _enum([
		"pebble",
		"stack",
		"chest",
		"vault",
		"netherite"
	]),
	origin: string().url()
}).parse(input)).handler(createSsrRpc("04d2f5681fb63810f06b79da32b0ba9be92d3533c0f6697e751a5cf81ff1691c"));
var fulfillCheckout = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((sessionId) => string().min(8).max(200).parse(sessionId)).handler(createSsrRpc("aae6bf4b8954f757aac49bfa5492a35e29244fdcfb93e3f6ebb2e3fb00b4460f"));
//#endregion
export { getLiveStatus as a, getPlayer as c, getWallet as d, getWatch as f, toggleWatch as g, startCheckout as h, getIntel as i, getRoster as l, saveClaim as m, getBounties as n, getOrders as o, postBounty as p, getClaim as r, getPayStatus as s, fulfillCheckout as t, getSnapshot as u };
