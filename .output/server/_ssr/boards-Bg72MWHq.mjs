import { o as __toESM } from "../_runtime.mjs";
import { r as formatWhen, t as cn } from "./utils-BqCTpu3b.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as Route$11 } from "./router-GoOMK_Bd.mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
import { t as PlayerFace } from "./player-face-COcr8QTs.mjs";
import { t as Badge } from "./badge-BfELlbQm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/boards-Bg72MWHq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	{
		id: "online",
		label: "Online"
	},
	{
		id: "recent",
		label: "Last seen"
	},
	{
		id: "sighted",
		label: "Most seen"
	}
];
function BoardsPage() {
	const roster = Route$11.useLoaderData();
	const [tab, setTab] = (0, import_react.useState)("online");
	const rows = (0, import_react.useMemo)(() => {
		const copy = [...roster];
		if (tab === "online") copy.sort((a, b) => Number(b.online) - Number(a.online) || b.last_seen.localeCompare(a.last_seen));
		if (tab === "recent") copy.sort((a, b) => b.last_seen.localeCompare(a.last_seen));
		if (tab === "sighted") copy.sort((a, b) => b.seen_count - a.seen_count);
		return tab === "online" ? copy.filter((p) => p.online) : copy;
	}, [roster, tab]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		eyebrow: "Ledger",
		title: "Who is actually here",
		lead: "Pulled from the live nlo.gg ping. No mock prestige. Sightings grow as people join.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(t.id),
				className: cn("min-h-11 rounded-sm px-4 font-display text-base mc-bevel", tab === t.id ? "bg-accent text-accent-foreground" : "tex-oak text-foreground"),
				children: t.label
			}, t.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: tab === "online" ? "Nobody online right now. Check Last seen." : "The ledger is empty until someone joins nlo.gg."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-lg text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "font-mono text-xs tracking-widest text-muted uppercase",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pr-3",
							children: "#"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pr-3",
							children: "Player"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 pr-3",
							children: "Last seen"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 text-right",
							children: "Sightings"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardRow, {
					p,
					rank: i + 1
				}, p.ign)) })]
			})
		}) })]
	});
}
function BoardRow({ p, rank }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "border-t border-line",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3 font-mono text-faint tabular-nums",
				children: rank
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/roster/$ign",
					params: { ign: p.ign },
					className: "flex items-center gap-2 font-medium hover:text-accent",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerFace, {
							ign: p.ign,
							uuid: p.uuid,
							size: 28
						}),
						p.ign,
						p.online ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "live",
							children: "On"
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 pr-3 text-muted",
				children: p.online ? "Now" : formatWhen(p.last_seen)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "py-3 text-right font-mono tabular-nums",
				children: p.seen_count
			})
		]
	});
}
//#endregion
export { BoardsPage as component };
