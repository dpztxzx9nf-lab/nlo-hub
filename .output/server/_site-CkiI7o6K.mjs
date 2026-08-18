import { c as SERVER, r as FEATURES } from "./_ssr/content-BXrVujn_.mjs";
import { n as formatInt, r as formatWhen } from "./_ssr/utils-BqCTpu3b.mjs";
import { H as require_jsx_runtime, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./_ssr/button-vH3iG3sD.mjs";
import { c as ArrowRight, i as Swords, n as Wallet, r as Trophy } from "./_libs/lucide-react.mjs";
import { n as CopyIp } from "./_ssr/copy-ip-BzX6ojqH.mjs";
import { c as Route$13 } from "./_ssr/router-GoOMK_Bd.mjs";
import { n as Panel } from "./_ssr/page-frame-GUKP_S0q.mjs";
import { t as PlayerFace } from "./_ssr/player-face-COcr8QTs.mjs";
import { t as Badge } from "./_ssr/badge-BfELlbQm.mjs";
import { t as StatusLive } from "./_ssr/status-live-BtogtN4x.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_site-CkiI7o6K.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { status, online, recent, openBounties } = Route$13.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative min-h-[78vh] overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/hero-plains.jpg",
					alt: "NLO plains at golden hour — HD grass, oak house, dirt path",
					className: "absolute inset-0 size-full object-cover"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-background via-background/55 to-background/15" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pt-24 pb-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusLive, { status }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: ["Java ", SERVER.version] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "oak",
									children: SERVER.season
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 max-w-3xl text-6xl leading-none sm:text-8xl",
							children: "NLO"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-xl text-accent sm:text-2xl",
							children: SERVER.fullName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-xl text-lg text-foreground/90",
							children: "An open survival SMP. Build, trade, raid, and hunt bounties on one shared world — plus a creative world where you buy plots and show off builds."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-wrap gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyIp, { size: "lg" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "oak",
									size: "lg",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/play",
										children: ["How to join", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "stone",
									size: "lg",
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: SERVER.discord,
										target: "_blank",
										rel: "noreferrer",
										children: "Discord"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-4 font-mono text-sm text-muted",
							children: [
								SERVER.ip,
								" · Java ",
								SERVER.version,
								" · Bedrock ",
								SERVER.bedrockPort,
								" · Console",
								" ",
								SERVER.consoleFriend
							]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: Swords,
					label: "Open conflict",
					value: "Outside spawn"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: Wallet,
					label: "Economy",
					value: "AH + player shops"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: Trophy,
					label: "On now",
					value: `${status.players}/${status.max}`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3",
			children: FEATURES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: f.href,
				className: "group block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden rounded-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: f.image,
							alt: "",
							className: "aspect-photo w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 text-2xl",
						children: f.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: f.body
					})
				] })
			}, f.title))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto mt-10 grid max-w-6xl gap-4 px-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				texture: "oak",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-accent uppercase",
						children: "Live"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-3xl",
						children: "On the world"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/roster",
							children: "Roster"
						})
					})]
				}), online.length === 0 && recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 text-sm text-muted",
					children: [
						"Nobody on the ledger yet. Join ",
						SERVER.ip,
						" and you will appear here."
					]
				}) : online.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Empty right now. Last seen:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 grid gap-2",
						children: recent.slice(0, 5).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerLine, {
							ign: p.ign,
							uuid: p.uuid,
							meta: formatWhen(p.last_seen)
						}, p.ign))
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-5 grid gap-2",
					children: online.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerLine, {
						ign: p.ign,
						uuid: p.uuid,
						meta: "Online",
						live: true
					}, p.ign))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-xs tracking-widest text-accent uppercase",
					children: "Hunt"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl",
					children: "Open bounties"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/bounties",
						children: "Board"
					})
				})]
			}), openBounties.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-sm text-muted",
				children: "No funded names yet. Sign in, claim your IGN, and post one."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-5 grid gap-3",
				children: openBounties.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start gap-3 rounded-sm bg-background/35 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerFace, {
						ign: b.target_ign,
						size: 36
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: b.target_ign
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "gold",
								children: formatInt(b.reward)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: b.reason
						})]
					})]
				}, b.id))
			})] })]
		})
	] });
}
function PlayerLine({ ign, uuid, meta, live }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/roster/$ign",
		params: { ign },
		className: "flex items-center gap-3 rounded-sm px-2 py-2 hover:bg-background/40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerFace, {
				ign,
				uuid,
				size: 32
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex-1 font-medium",
				children: ign
			}),
			live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "live",
				children: "On"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs text-muted",
				children: meta
			})
		]
	}) });
}
function Stat({ icon: Icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "tex-oak rounded-lg p-1 mc-bevel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 rounded-md bg-background/50 px-4 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-xs tracking-widest text-muted uppercase",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl",
				children: value
			})] })]
		})
	});
}
//#endregion
export { Home as component };
