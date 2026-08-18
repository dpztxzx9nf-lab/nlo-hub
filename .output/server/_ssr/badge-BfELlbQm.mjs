import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-BqCTpu3b.mjs";
import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-BfELlbQm.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-xs font-medium uppercase tracking-wide", {
	variants: { variant: {
		default: "bg-foreground/10 text-foreground",
		live: "bg-live text-live-foreground",
		wanted: "bg-wanted text-wanted-foreground",
		gold: "bg-gold text-gold-foreground",
		oak: "bg-oak text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
//#endregion
export { Badge as t };
