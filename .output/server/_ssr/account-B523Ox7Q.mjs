import { o as __toESM } from "../_runtime.mjs";
import { n as formatInt } from "./utils-BqCTpu3b.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-vH3iG3sD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as authClient } from "./client-BvftpRqP.mjs";
import { n as useCurrentUserState } from "./use-current-user-hVneEV00.mjs";
import { t as RedirectToSignIn } from "./gates-DrFjkWB0.mjs";
import { d as getWallet, f as getWatch, m as saveClaim, r as getClaim } from "./server-CmQjQKGz.mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
import { t as PlayerFace } from "./player-face-COcr8QTs.mjs";
import { t as Input } from "./input-D9dJgPsQ.mjs";
import { t as passwordIssues } from "./password-CqOEJuK1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-B523Ox7Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AccountPage() {
	const { user, isPending } = useCurrentUserState();
	const [ign, setIgn] = (0, import_react.useState)("");
	const [claimed, setClaimed] = (0, import_react.useState)(null);
	const [watch, setWatch] = (0, import_react.useState)([]);
	const [coins, setCoins] = (0, import_react.useState)(0);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		let cancelled = false;
		Promise.all([
			getClaim(),
			getWatch(),
			getWallet()
		]).then(([c, w, wallet]) => {
			if (cancelled) return;
			setClaimed(c);
			setIgn(c ?? "");
			setWatch(w.map((row) => row.ign));
			setCoins(wallet.coins);
			setReady(true);
		}).catch(() => {
			if (!cancelled) setReady(true);
		});
		return () => {
			cancelled = true;
		};
	}, [isPending, user]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageFrame, {
		eyebrow: "Desk",
		title: "Your desk",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-lg bg-foreground/5" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function save(e) {
		e.preventDefault();
		setBusy(true);
		try {
			const next = await saveClaim({ data: ign });
			setClaimed(next);
			toast.success(`Claimed ${next}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not claim that name");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		eyebrow: "Desk",
		title: user.displayName ?? "Player desk",
		lead: "Claim the IGN you play under, watch names, and keep your NLO coin balance. Shop packs land here.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				texture: "oak",
				className: "mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-accent uppercase",
							children: "Coins"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-display text-5xl tabular-nums",
							children: ready ? formatInt(coins) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Spends in NLO shops, AH, plots, and bounties."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/shop",
							children: "Buy coins"
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					texture: "oak",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl",
							children: "Claim IGN"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 flex flex-col gap-3 sm:flex-row",
							onSubmit: (e) => void save(e),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: ign,
								onChange: (e) => setIgn(e.target.value),
								placeholder: "Your Minecraft name",
								required: true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy || !ready,
								children: "Save"
							})]
						}),
						claimed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerFace, {
								ign: claimed,
								size: 40
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: ["Posting and watches use ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground",
									children: claimed
								})]
							})]
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl",
					children: "Watchlist"
				}), !ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-16 animate-pulse rounded-sm bg-foreground/5" }) : watch.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "No names yet. Open a roster card and hit Watch."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-2",
					children: watch.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/roster/$ign",
						params: { ign: name },
						className: "flex items-center gap-2 rounded-sm px-2 py-2 hover:bg-background/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerFace, {
							ign: name,
							size: 28
						}), name]
					}) }, name))
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangePassword, { email: user.primaryEmail ?? "" })
		]
	});
}
function ChangePassword({ email }) {
	const [current, setCurrent] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		const issues = passwordIssues(next, email);
		if (next !== confirm) issues.push("New passwords do not match.");
		if (current && current === next) issues.push("Pick a different password.");
		if (issues.length) {
			toast.error(issues[0]);
			return;
		}
		setBusy(true);
		try {
			const { error } = await authClient.changePassword({
				currentPassword: current,
				newPassword: next,
				revokeOtherSessions: true
			});
			if (error) {
				toast.error("Could not change password. Check the current one.");
				return;
			}
			setCurrent("");
			setNext("");
			setConfirm("");
			toast.success("Password updated. Other sessions were signed out.");
		} catch {
			toast.error("Could not change password.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "mt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xl",
				children: "Password"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Changing it signs out every other device. There is no email reset — keep Google or X as a backup, or write the password down offline."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 grid gap-3 sm:max-w-md",
				onSubmit: (e) => void onSubmit(e),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						autoComplete: "current-password",
						placeholder: "Current password",
						value: current,
						onChange: (e) => setCurrent(e.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						autoComplete: "new-password",
						minLength: 12,
						placeholder: `New password (12+ chars)`,
						value: next,
						onChange: (e) => setNext(e.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						autoComplete: "new-password",
						minLength: 12,
						placeholder: "Confirm new password",
						value: confirm,
						onChange: (e) => setConfirm(e.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "stone",
						disabled: busy,
						children: busy ? "Updating…" : "Update password"
					})
				]
			})
		]
	});
}
//#endregion
export { AccountPage as component };
