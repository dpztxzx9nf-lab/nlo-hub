import { o as __toESM } from "../_runtime.mjs";
import { n as formatInt } from "./utils-BqCTpu3b.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-vH3iG3sD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useCurrentUserState } from "./use-current-user-hVneEV00.mjs";
import { p as postBounty } from "./server-CmQjQKGz.mjs";
import { o as Route$10 } from "./router-GoOMK_Bd.mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
import { t as PlayerFace } from "./player-face-COcr8QTs.mjs";
import { t as Badge } from "./badge-BfELlbQm.mjs";
import { t as Input } from "./input-D9dJgPsQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bounties-Q7_aFuvo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BountiesPage() {
	const initial = Route$10.useLoaderData();
	const [list, setList] = (0, import_react.useState)(initial);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		eyebrow: "Hunt",
		title: "Bounty board",
		lead: "Funded names only. Coin leaves the poster’s purse when the claim is turned in.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-6 overflow-hidden rounded-lg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/world-raid.jpg",
					alt: "Night village under raid weather",
					className: "aspect-banner w-full object-cover"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PostForm, { onPosted: (row) => {
				if (row) setList((cur) => [row, ...cur]);
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 grid gap-3",
				children: list.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					texture: b.status === "open" ? "oak" : "stone",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-3 sm:flex-row sm:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerFace, {
							ign: b.target_ign,
							size: 48
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/roster/$ign",
											params: { ign: b.target_ign },
											className: "font-display text-2xl hover:text-accent",
											children: b.target_ign
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: b.status === "open" ? "wanted" : "oak",
											children: b.status
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "gold",
											children: [formatInt(b.reward), " coins"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: b.reason
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 font-mono text-xs text-faint",
									children: ["Posted by ", b.posted_by]
								})
							]
						})]
					})
				}) }, b.id))
			})
		]
	});
}
function PostForm({ onPosted }) {
	const { user, isPending } = useCurrentUserState();
	const [target, setTarget] = (0, import_react.useState)("");
	const [reward, setReward] = (0, import_react.useState)("2500");
	const [reason, setReason] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-lg bg-foreground/5" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-muted",
		children: "Sign in and claim your IGN to post a funded bounty."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		className: "mt-3",
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/login",
			children: "Sign in"
		})
	})] });
	async function submit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			onPosted(await postBounty({ data: {
				target,
				reward: Number(reward),
				reason
			} }));
			setTarget("");
			setReason("");
			toast.success("Bounty posted");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not post bounty");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		texture: "oak",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xl",
			children: "Post a bounty"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3 md:grid-cols-[1fr_8rem_1fr_auto]",
			onSubmit: (e) => void submit(e),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: target,
					onChange: (e) => setTarget(e.target.value),
					placeholder: "Target IGN",
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: reward,
					onChange: (e) => setReward(e.target.value),
					type: "number",
					min: 500,
					max: 1e5,
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: reason,
					onChange: (e) => setReason(e.target.value),
					placeholder: "Why they are on the board",
					required: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: "Fund"
				})
			]
		})]
	});
}
//#endregion
export { BountiesPage as component };
