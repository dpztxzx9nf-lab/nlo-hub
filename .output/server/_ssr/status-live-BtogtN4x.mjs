import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Badge } from "./badge-BfELlbQm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/status-live-BtogtN4x.js
var import_jsx_runtime = require_jsx_runtime();
function StatusLive({ status }) {
	if (!status.checked) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "oak",
		children: ["Status unknown · Java ", status.version ?? "26.2"]
	});
	if (!status.online) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "wanted",
		children: "Offline"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		variant: "live",
		children: [
			status.players,
			"/",
			status.max,
			" online"
		]
	});
}
//#endregion
export { StatusLive as t };
