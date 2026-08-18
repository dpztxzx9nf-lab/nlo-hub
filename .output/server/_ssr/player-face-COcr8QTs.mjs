import { t as cn } from "./utils-BqCTpu3b.mjs";
import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/player-face-COcr8QTs.js
var import_jsx_runtime = require_jsx_runtime();
function PlayerFace({ ign, uuid, size = 40, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: `https://mc-heads.net/avatar/${encodeURIComponent(uuid || ign)}/${size}`,
		alt: "",
		width: size,
		height: size,
		className: cn("shrink-0 rounded-xs bg-oak", className),
		style: { imageRendering: "pixelated" },
		crossOrigin: "anonymous"
	});
}
//#endregion
export { PlayerFace as t };
