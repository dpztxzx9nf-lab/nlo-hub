import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime, _ as createRootRoute, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, x as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as __exportAll } from "./ssr.mjs";
import { F as object, M as literal, P as number, R as string, z as union } from "../_libs/@better-auth/core+[...].mjs";
import { n as auth } from "./server-74nkyqEk.mjs";
import { a as getLiveStatus, c as getPlayer, i as getIntel, l as getRoster, n as getBounties, u as getSnapshot } from "./server-CmQjQKGz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-GoOMK_Bd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppErrorComponent({ error, reset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs tracking-widest text-accent uppercase",
				children: "Ledger hiccup"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl",
				children: "Could not load that page"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: error.message || "Try again. The world is still up."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap justify-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => reset(),
					className: "min-h-11 rounded-sm bg-accent px-5 font-display text-accent-foreground mc-bevel",
					children: "Try again"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "min-h-11 rounded-sm tex-oak px-5 py-2.5 font-display mc-bevel",
					children: "Home"
				})]
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
/**
* Whether `origin` is a known Grok embedder. Exported for tests.
* Do not list internal staging hosts here — this file ships in download/export.
*/
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
/** Public preview zone. Staging embedders frame this host via the proxy CSP. */
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
/** Resolve the parent origin to post to, or null when the bridge must noop. */
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	const candidates = [referrer, ancestorOrigin ?? ""].filter(Boolean);
	for (const candidate of candidates) try {
		const origin = candidate.includes("://") ? new URL(candidate).origin : candidate;
		if (isGrokEmbedderOrigin(origin)) return origin;
		if (!isSandboxPreviewGuestHost(guestHostname)) continue;
		const parsed = new URL(origin.includes("://") ? origin : `https://${origin}`);
		if (parsed.protocol === "https:" || parsed.protocol === "http:") return parsed.origin;
	} catch {}
	return null;
}
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-DQ7Ck8aS.css";
var APP_NAME = "NLO";
var Route$15 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "NLO — Netherite Legends Odyssey. Live Java 26.2 / Bedrock SMP. Roster is pulled from the real server ping."
			},
			{
				name: "apple-mobile-web-app-title",
				content: APP_NAME
			},
			{
				name: "theme-color",
				content: "#0e1610"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				property: "og:title",
				content: "NLO — open SMP with consequences"
			},
			...[]
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/nlo-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Pixelify+Sans:wght@400;500;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitErrorComponentImporter = () => import("../_site-rsZw-AZI.mjs");
var $$splitComponentImporter$13 = () => import("../_site-B8_is3RY.mjs");
var Route$14 = createFileRoute("/_site")({
	component: lazyRouteComponent($$splitComponentImporter$13, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent")
});
var $$splitComponentImporter$12 = () => import("../_site-CkiI7o6K.mjs");
var Route$13 = createFileRoute("/_site/")({
	loader: async () => {
		const [snap, bounties] = await Promise.all([getSnapshot(), getBounties()]);
		return {
			status: snap.status,
			motd: snap.status.motd,
			online: snap.roster.filter((p) => p.online),
			recent: snap.roster.slice(0, 8),
			openBounties: bounties.filter((b) => b.status === "open").slice(0, 4)
		};
	},
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./account-B523Ox7Q.mjs");
var Route$12 = createFileRoute("/_site/account")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./boards-Bg72MWHq.mjs");
var Route$11 = createFileRoute("/_site/boards")({
	loader: () => getRoster(),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./bounties-Q7_aFuvo.mjs");
var Route$10 = createFileRoute("/_site/bounties")({
	loader: () => getBounties(),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./intel-BZrGECDq.mjs");
var Route$9 = createFileRoute("/_site/intel")({
	loader: () => getIntel(),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./login-3zZDJJ5-.mjs");
var Route$8 = createFileRoute("/_site/login")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./play-Ct4ti_Rg.mjs");
var Route$7 = createFileRoute("/_site/play")({
	loader: () => getLiveStatus(),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./roster-t5kQ6Eo-.mjs");
var Route$6 = createFileRoute("/_site/roster")({
	loader: () => getRoster(),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./rules-BVWn0J9n.mjs");
var Route$5 = createFileRoute("/_site/rules")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./season-CGENRYVY.mjs");
var Route$4 = createFileRoute("/_site/season")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./shop-D2fPXZo6.mjs");
var Route$3 = createFileRoute("/_site/shop")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./world-DyEHMVrh.mjs");
var Route$2 = createFileRoute("/_site/world")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./roster._ign-CYOvv6mi.mjs");
var Route$1 = createFileRoute("/_site/roster/$ign")({
	loader: async ({ params }) => getPlayer({ data: params.ign }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var SiteRoute = Route$14.update({
	id: "/_site",
	getParentRoute: () => Route$15
});
var SiteIndexRoute = Route$13.update({
	id: "/",
	path: "/",
	getParentRoute: () => SiteRoute
});
var SiteAccountRoute = Route$12.update({
	id: "/account",
	path: "/account",
	getParentRoute: () => SiteRoute
});
var SiteBoardsRoute = Route$11.update({
	id: "/boards",
	path: "/boards",
	getParentRoute: () => SiteRoute
});
var SiteBountiesRoute = Route$10.update({
	id: "/bounties",
	path: "/bounties",
	getParentRoute: () => SiteRoute
});
var SiteIntelRoute = Route$9.update({
	id: "/intel",
	path: "/intel",
	getParentRoute: () => SiteRoute
});
var SiteLoginRoute = Route$8.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => SiteRoute
});
var SitePlayRoute = Route$7.update({
	id: "/play",
	path: "/play",
	getParentRoute: () => SiteRoute
});
var SiteRosterRoute = Route$6.update({
	id: "/roster",
	path: "/roster",
	getParentRoute: () => SiteRoute
});
var SiteRulesRoute = Route$5.update({
	id: "/rules",
	path: "/rules",
	getParentRoute: () => SiteRoute
});
var SiteSeasonRoute = Route$4.update({
	id: "/season",
	path: "/season",
	getParentRoute: () => SiteRoute
});
var SiteShopRoute = Route$3.update({
	id: "/shop",
	path: "/shop",
	getParentRoute: () => SiteRoute
});
var SiteWorldRoute = Route$2.update({
	id: "/world",
	path: "/world",
	getParentRoute: () => SiteRoute
});
var SiteRosterIgnRoute = Route$1.update({
	id: "/$ign",
	path: "/$ign",
	getParentRoute: () => SiteRosterRoute
});
var ApiAuthSplatRoute = Route.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$15
});
var SiteRosterRouteChildren = { SiteRosterIgnRoute };
var SiteRouteChildren = {
	SiteAccountRoute,
	SiteBoardsRoute,
	SiteBountiesRoute,
	SiteIntelRoute,
	SiteLoginRoute,
	SitePlayRoute,
	SiteRosterRoute: SiteRosterRoute._addFileChildren(SiteRosterRouteChildren),
	SiteRulesRoute,
	SiteSeasonRoute,
	SiteShopRoute,
	SiteWorldRoute,
	SiteIndexRoute
};
var rootRouteChildren = {
	SiteRoute: SiteRoute._addFileChildren(SiteRouteChildren),
	ApiAuthSplatRoute
};
var routeTree = Route$15._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$9 as a, Route$13 as c, Route$7 as i, AppErrorComponent as l, Route$1 as n, Route$10 as o, Route$6 as r, Route$11 as s, router_exports as t };
