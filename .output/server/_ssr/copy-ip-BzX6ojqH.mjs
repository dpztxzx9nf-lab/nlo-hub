import { o as __toESM } from "../_runtime.mjs";
import { c as SERVER } from "./content-BXrVujn_.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-vH3iG3sD.mjs";
import { o as Copy, s as Check } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/copy-ip-BzX6ojqH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CopyValue({ value, label, variant = "default", size = "default" }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	async function copy() {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			toast.success(`Copied ${label}`);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			toast.error(`Could not copy — select ${label} yourself`);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant,
		size,
		onClick: () => void copy(),
		children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), label]
	});
}
function CopyIp({ variant = "default", size = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyValue, {
		value: SERVER.ip,
		label: SERVER.ip,
		variant,
		size
	});
}
function CopyConsoleFriend({ variant = "gold", size = "default" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyValue, {
		value: SERVER.consoleFriend,
		label: SERVER.consoleFriend,
		variant,
		size
	});
}
//#endregion
export { CopyIp as n, CopyConsoleFriend as t };
