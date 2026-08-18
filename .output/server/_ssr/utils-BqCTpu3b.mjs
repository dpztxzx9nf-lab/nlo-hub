import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-BqCTpu3b.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatInt(n) {
	return new Intl.NumberFormat("en-US").format(n);
}
function formatWhen(iso) {
	if (!iso) return "Never";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "Never";
	const diff = Date.now() - d.getTime();
	const min = Math.round(diff / 6e4);
	if (min < 1) return "Just now";
	if (min < 60) return `${min}m ago`;
	const hr = Math.round(min / 60);
	if (hr < 24) return `${hr}h ago`;
	const day = Math.round(hr / 24);
	if (day < 14) return `${day}d ago`;
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
//#endregion
export { formatInt as n, formatWhen as r, cn as t };
