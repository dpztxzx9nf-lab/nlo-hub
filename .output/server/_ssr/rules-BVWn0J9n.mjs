import { s as RULES } from "./content-BXrVujn_.mjs";
import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rules-BVWn0J9n.js
var import_jsx_runtime = require_jsx_runtime();
function RulesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageFrame, {
		eyebrow: "Fair play",
		title: "The rules are short",
		lead: "Conflict is the game. Cheats are not. If it is outside protected spawn, assume someone can take it.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: RULES.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				texture: block.title.startsWith("Conflict") ? "oak" : "stone",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: block.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-3 text-sm text-muted",
					children: block.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "border-l-2 border-accent/60 pl-3",
						children: item
					}, item))
				})]
			}, block.title))
		})
	});
}
//#endregion
export { RulesPage as component };
