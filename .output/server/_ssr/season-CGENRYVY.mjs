import { c as SERVER, o as PRIZES, t as CHALLENGES } from "./content-BXrVujn_.mjs";
import { H as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-vH3iG3sD.mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
import { t as Badge } from "./badge-BfELlbQm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/season-CGENRYVY.js
var import_jsx_runtime = require_jsx_runtime();
function SeasonPage() {
	const started = /* @__PURE__ */ new Date(`${SERVER.seasonStart}T00:00:00Z`);
	const days = Math.max(1, Math.floor((Date.now() - started.getTime()) / 864e5));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		eyebrow: SERVER.season,
		title: "Play for the close",
		lead: "Top player takes $20 — cloak, skin, Minecoins, gift card, or a split. Top clan pays 25,000 coins to every member.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6 overflow-hidden rounded-lg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/world-hills.jpg",
					alt: "Lush NLO hills with HD grass and a river",
					className: "aspect-banner w-full object-cover"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6 grid gap-4 md:grid-cols-2",
				children: PRIZES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					texture: "oak",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-accent uppercase",
							children: p.place
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-3xl",
							children: p.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: p.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-mono text-xs text-faint",
							children: p.note
						})
					]
				}, p.place))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs tracking-widest text-muted uppercase",
							children: ["Day ", days]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-3xl",
							children: "Season track"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "default",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/boards",
									children: "Boards"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "stone",
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/bounties",
									children: "Bounties"
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-5 h-3 overflow-hidden rounded-sm bg-background/60 mc-inset",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "tex-grass h-full w-3/5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-xs text-muted",
						children: "How we rank #1 is still being written. Show up. The purse waits."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: CHALLENGES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: c.cadence === "Season" ? "gold" : "oak",
							children: c.cadence
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-muted",
							children: c.reward
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-3 text-2xl",
						children: c.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: c.detail
					})
				] }, c.title))
			})
		]
	});
}
//#endregion
export { SeasonPage as component };
