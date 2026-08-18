import { o as __toESM } from "../_runtime.mjs";
import { n as COIN_PACKS } from "./content-BXrVujn_.mjs";
import { n as formatInt, r as formatWhen } from "./utils-BqCTpu3b.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-vH3iG3sD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCurrentUserState } from "./use-current-user-hVneEV00.mjs";
import { t as RedirectToSignIn } from "./gates-DrFjkWB0.mjs";
import { d as getWallet, h as startCheckout, o as getOrders, s as getPayStatus, t as fulfillCheckout } from "./server-CmQjQKGz.mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
import { t as Badge } from "./badge-BfELlbQm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-D2fPXZo6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShopPage() {
	const { user, isPending } = useCurrentUserState();
	const [coins, setCoins] = (0, import_react.useState)(0);
	const [orders, setOrders] = (0, import_react.useState)([]);
	const [card, setCard] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const [paidId, setPaidId] = (0, import_react.useState)(null);
	const [canceled, setCanceled] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const q = new URLSearchParams(window.location.search);
		const paid = q.get("paid");
		if (paid) setPaidId(paid);
		if (q.get("cancel") === "1") setCanceled(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		let cancelled = false;
		Promise.all([
			getWallet(),
			getOrders(),
			getPayStatus()
		]).then(([w, o, pay]) => {
			if (cancelled) return;
			setCoins(w.coins);
			setOrders(o);
			setCard(pay.card);
			setReady(true);
		}).catch(() => {
			if (!cancelled) setReady(true);
		});
		return () => {
			cancelled = true;
		};
	}, [isPending, user]);
	(0, import_react.useEffect)(() => {
		if (!user || !paidId) return;
		let cancelled = false;
		setBusy("paid");
		fulfillCheckout({ data: paidId }).then((res) => {
			if (cancelled) return;
			setCoins(res.wallet.coins);
			setOrders((prev) => {
				return [res.order, ...prev.filter((o) => o.id !== res.order.id)].slice(0, 20);
			});
			toast.success(res.already ? "That pack is already on this desk." : `Added ${formatInt(res.order.coins)} coins`);
		}).catch((err) => {
			if (!cancelled) toast.error(err instanceof Error ? err.message : "Could not confirm payment");
		}).finally(() => {
			if (!cancelled) setBusy(null);
		});
		return () => {
			cancelled = true;
		};
	}, [user, paidId]);
	(0, import_react.useEffect)(() => {
		if (canceled) toast.message("Checkout canceled. No charge.");
	}, [canceled]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageFrame, {
		eyebrow: "Commerce",
		title: "Coin shop",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-lg bg-foreground/5" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function pay(packId) {
		if (!card) {
			toast.error("Card checkout is not connected yet.");
			return;
		}
		setBusy(packId);
		try {
			const { url } = await startCheckout({ data: {
				packId,
				origin: window.location.origin
			} });
			window.location.href = url;
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Checkout failed");
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		eyebrow: "Commerce",
		title: "Buy coins",
		lead: "Pays by card through Stripe. Coins land on this desk after the charge succeeds — shops, AH, plots, bounties.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				texture: "oak",
				className: "mb-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-accent uppercase",
							children: "Balance"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-5xl tabular-nums",
							children: ready ? formatInt(coins) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: card ? "Card checkout is live. Stripe handles the card — we never see the number." : "Packs are listed. Card checkout turns on when Stripe is connected."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "stone",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/account",
							children: "Manage account"
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: COIN_PACKS.map((pack) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					texture: pack.id === "netherite" ? "oak" : void 0,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl",
								children: pack.name
							}), "tag" in pack && pack.tag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "gold",
								children: pack.tag
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-display text-4xl tabular-nums",
							children: formatInt(pack.coins)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "coins"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: pack.blurb
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono text-sm",
								children: ["$", pack.usd]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: pack.id === "chest" || pack.id === "netherite" ? "default" : "oak",
								disabled: busy !== null,
								onClick: () => setConfirm(pack),
								children: "Buy"
							})]
						})
					]
				}, pack.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl",
						children: "Receipts"
					}),
					orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "No paid packs yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 grid gap-2",
						children: orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center justify-between gap-2 rounded-sm bg-background/35 px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium capitalize",
									children: o.pack_id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-sm tabular-nums",
									children: ["+", formatInt(o.coins)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm text-muted",
									children: ["$", o.usd]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-xs text-faint",
									children: formatWhen(o.created_at)
								})
							]
						}, o.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-xs text-faint",
						children: "NLO coins are game currency. No cash-out. Sales are final except where law requires."
					})
				]
			}),
			confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-end bg-background/70 p-4 sm:place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					texture: "oak",
					className: "w-full max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-accent uppercase",
							children: "Card checkout"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-3xl",
							children: confirm.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-muted",
							children: [
								formatInt(confirm.coins),
								" coins for $",
								confirm.usd,
								". Stripe takes the card. Coins credit only after the charge succeeds."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								disabled: busy !== null,
								onClick: () => void pay(confirm.id),
								children: busy ? "Opening Stripe…" : card ? `Pay $${confirm.usd}` : "Checkout not connected"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "stone",
								disabled: busy !== null,
								onClick: () => setConfirm(null),
								children: "Cancel"
							})]
						})
					]
				})
			}) : null
		]
	});
}
//#endregion
export { ShopPage as component };
