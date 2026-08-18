import { c as SERVER, i as JOIN_STEPS } from "./content-BXrVujn_.mjs";
import { H as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-vH3iG3sD.mjs";
import { n as CopyIp, t as CopyConsoleFriend } from "./copy-ip-BzX6ojqH.mjs";
import { i as Route$7 } from "./router-GoOMK_Bd.mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
import { t as Badge } from "./badge-BfELlbQm.mjs";
import { t as StatusLive } from "./status-live-BtogtN4x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/play-Ct4ti_Rg.js
var import_jsx_runtime = require_jsx_runtime();
function PlayPage() {
	const status = Route$7.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		eyebrow: "Connect",
		title: "Join the world",
		lead: "Native Java is 26.2. Phone and Windows Bedrock use the IP. Consoles add Minecraft friend NLO#3114 — they are still Bedrock.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusLive, { status }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: ["Java ", SERVER.version] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "oak",
						children: SERVER.compat
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						variant: "oak",
						children: ["Bedrock ", SERVER.bedrockPort]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIp, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyConsoleFriend, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "stone",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: SERVER.discord,
							target: "_blank",
							rel: "noreferrer",
							children: "Discord first"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				texture: "oak",
				className: "mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-accent uppercase",
						children: "Version"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "mt-2 text-2xl",
						children: [
							"Java ",
							SERVER.version,
							" first"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 max-w-3xl text-sm text-muted",
						children: [
							"The world runs on Minecraft Java ",
							SERVER.version,
							". ",
							SERVER.compat,
							" lets some older Java versions in. Bedrock on phone or Windows uses ",
							SERVER.ip,
							":",
							SERVER.bedrockPort,
							". Xbox, PlayStation, and Switch cannot add that address — add friend",
							" ",
							SERVER.consoleFriend,
							" and join from the friend list."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						texture: "oak",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-3xl",
								children: "Java"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: ["Multiplayer → Add Server → ", SERVER.ip]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "mt-5 grid gap-4",
								children: JOIN_STEPS.java.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-9 shrink-0 place-items-center rounded-sm tex-grass font-mono text-accent-foreground mc-bevel",
										children: i + 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: step.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted",
										children: step.detail
									})] })]
								}, step.title))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-3xl",
							children: "Bedrock"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								"Phone and Windows · ",
								SERVER.ip,
								":",
								SERVER.bedrockPort
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-5 grid gap-4",
							children: JOIN_STEPS.bedrock.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-9 shrink-0 place-items-center rounded-sm tex-stone font-mono mc-bevel",
									children: i + 1
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: step.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: step.detail
								})] })]
							}, step.title))
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						texture: "oak",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-3xl",
								children: "Console"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									"Still Bedrock. Add friend ",
									SERVER.consoleFriend,
									"."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "mt-5 grid gap-4",
								children: JOIN_STEPS.console.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-9 shrink-0 place-items-center rounded-sm tex-grass font-mono text-accent-foreground mc-bevel",
										children: i + 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: step.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted",
										children: step.detail
									})] })]
								}, step.title))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyConsoleFriend, { variant: "default" })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 overflow-hidden rounded-lg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/spawn-plaza.jpg",
					alt: "NLO spawn plaza in stone brick and oak",
					className: "aspect-banner w-full object-cover"
				})
			})
		]
	});
}
//#endregion
export { PlayPage as component };
