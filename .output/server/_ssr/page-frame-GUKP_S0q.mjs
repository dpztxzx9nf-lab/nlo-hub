import { t as cn } from "./utils-BqCTpu3b.mjs";
import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-frame-GUKP_S0q.js
var import_jsx_runtime = require_jsx_runtime();
function PageFrame({ eyebrow, title, lead, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("mx-auto max-w-6xl px-4 pt-10 pb-16", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs tracking-[0.18em] text-accent uppercase",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-4xl sm:text-5xl",
				children: title
			}),
			lead ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-2xl text-muted",
				children: lead
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children
			})
		]
	});
}
function Panel({ children, className, texture = "stone" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-lg p-1 mc-bevel", texture === "oak" ? "tex-oak" : "tex-stone", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-md bg-background/55 p-5",
			children
		})
	});
}
//#endregion
export { Panel as n, PageFrame as t };
