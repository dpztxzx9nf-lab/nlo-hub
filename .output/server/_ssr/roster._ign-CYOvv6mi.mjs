import { o as __toESM } from "../_runtime.mjs";
import { r as formatWhen } from "./utils-BqCTpu3b.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-vH3iG3sD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCurrentUserState } from "./use-current-user-hVneEV00.mjs";
import { g as toggleWatch } from "./server-CmQjQKGz.mjs";
import { n as Route$1 } from "./router-GoOMK_Bd.mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
import { t as PlayerFace } from "./player-face-COcr8QTs.mjs";
import { t as Badge } from "./badge-BfELlbQm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roster._ign-CYOvv6mi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const player = Route$1.useLoaderData();
	const { user, isPending } = useCurrentUserState();
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (!player) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		eyebrow: "Missing",
		title: "Not on the ledger",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: "That name is not a valid Minecraft name."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/roster",
				children: "Back to roster"
			})
		})]
	});
	const seen = player.seen_count > 0;
	async function watch() {
		if (!user || !player) return;
		setBusy(true);
		try {
			const res = await toggleWatch({ data: player.ign });
			toast.success(res.watching ? `Watching ${player.ign}` : `Dropped ${player.ign}`);
		} catch {
			toast.error("Sign in to watch a player");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageFrame, {
		eyebrow: seen ? "Seen on nlo.gg" : "Unknown",
		title: player.ign,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[280px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				texture: "oak",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerFace, {
							ign: player.ign,
							uuid: player.uuid,
							size: 96
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-display text-3xl",
							children: player.ign
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap justify-center gap-2",
							children: [player.online ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "live",
								children: "Online"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Offline" }), seen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "oak",
								children: "Ledger"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "wanted",
								children: "Unseen"
							})]
						}),
						!isPending && user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4 w-full",
							variant: "stone",
							disabled: busy,
							onClick: () => void watch(),
							children: "Watch"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4 w-full",
							variant: "stone",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/login",
								children: "Sign in to watch"
							})
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Status",
						value: player.online ? "Online" : "Offline"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Last seen",
						value: seen ? formatWhen(player.last_seen) : "Never"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "First seen",
						value: seen ? formatWhen(player.first_seen) : "Never"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Sightings",
						value: String(player.seen_count)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						className: "sm:col-span-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-widest text-muted uppercase",
								children: "UUID"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 break-all font-mono text-sm text-muted",
								children: player.uuid ?? "Not reported by the server yet."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: seen ? "This card is built from the live Java ping. Prestige and coins will land here when the server exposes them." : "This name has not shown up on nlo.gg since the ledger started watching."
							})
						]
					})
				]
			})]
		})
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-mono text-xs tracking-widest text-muted uppercase",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 font-display text-2xl tabular-nums",
		children: value
	})] });
}
//#endregion
export { ProfilePage as component };
