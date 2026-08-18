import { o as __toESM } from "../_runtime.mjs";
import { r as formatWhen } from "./utils-BqCTpu3b.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$6 } from "./router-GoOMK_Bd.mjs";
import { t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
import { t as PlayerFace } from "./player-face-COcr8QTs.mjs";
import { t as Badge } from "./badge-BfELlbQm.mjs";
import { t as Input } from "./input-D9dJgPsQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roster-t5kQ6Eo-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RosterPage() {
	const roster = Route$6.useLoaderData();
	const [q, setQ] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => {
		const s = q.trim().toLowerCase();
		if (!s) return roster;
		return roster.filter((p) => p.ign.toLowerCase().includes(s));
	}, [q, roster]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		eyebrow: "Players",
		title: "Who the server has seen",
		lead: "Names come from the live Paper ping on nlo.gg — not a mock list. Join and you land here.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value: q,
			onChange: (e) => setQ(e.target.value),
			placeholder: "Search a name",
			className: "mb-5 max-w-md"
		}), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted",
			children: roster.length === 0 ? "The ledger is empty until someone joins nlo.gg." : "No one by that name on the ledger."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid gap-3 sm:grid-cols-2",
			children: filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/roster/$ign",
				params: { ign: p.ign },
				className: "tex-stone flex items-center gap-3 rounded-lg p-1 mc-bevel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-1 items-center gap-3 rounded-md bg-background/55 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerFace, {
						ign: p.ign,
						uuid: p.uuid,
						size: 48
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-xl leading-none",
								children: p.ign
							}), p.online ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "live",
								children: "On"
							}) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								p.online ? "Online now" : `Last seen ${formatWhen(p.last_seen)}`,
								" · ",
								"seen ",
								p.seen_count,
								"×"
							]
						})]
					})]
				})
			}) }, p.ign))
		})]
	});
}
//#endregion
export { RosterPage as component };
