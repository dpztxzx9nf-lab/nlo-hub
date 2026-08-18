import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Route$9 } from "./router-GoOMK_Bd.mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
import { t as Badge } from "./badge-BfELlbQm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/intel-BZrGECDq.js
var import_jsx_runtime = require_jsx_runtime();
function IntelPage() {
	const items = Route$9.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageFrame, {
		eyebrow: "Dispatches",
		title: "Intel",
		lead: "Patch notes, market hours, and whatever Quill wrote down before someone raided the library.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-3",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				texture: item.kind === "patch" ? "stone" : "oak",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: item.kind === "event" ? "gold" : "oak",
							children: item.kind
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-xs text-faint",
							children: item.posted_at.slice(0, 10)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 text-2xl",
						children: item.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-muted",
						children: item.body
					})
				]
			}, item.id))
		})
	});
}
//#endregion
export { IntelPage as component };
