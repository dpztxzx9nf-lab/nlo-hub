import "../_runtime.mjs";
import { t as cn } from "./utils-BqCTpu3b.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-11 w-full rounded-sm border border-line bg-background/70 px-3 text-base text-foreground outline-none mc-inset placeholder:text-faint focus-visible:border-accent", className),
		...props
	});
}
//#endregion
export { Input as t };
