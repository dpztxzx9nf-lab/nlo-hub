import { l as WORLD_PILLARS } from "./content-BXrVujn_.mjs";
import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/world-DyEHMVrh.js
var import_jsx_runtime = require_jsx_runtime();
function WorldPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageFrame, {
		eyebrow: "The map",
		title: "A living SMP",
		lead: "HD grass, a market that never sleeps, and a creative world where you buy plots to show off builds. Survival does not reset with the season.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4",
			children: WORLD_PILLARS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				texture: "oak",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2 md:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: p.image,
						alt: "",
						className: "aspect-photo w-full rounded-sm object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl",
						children: p.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-muted",
						children: p.body
					})] })]
				})
			}, p.title))
		})
	});
}
//#endregion
export { WorldPage as component };
