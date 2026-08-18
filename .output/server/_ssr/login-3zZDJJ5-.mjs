import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { H as require_jsx_runtime, b as useNavigate, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Button } from "./button-vH3iG3sD.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as signIn, t as authClient } from "./client-BvftpRqP.mjs";
import { t as GROK_PROVIDERS } from "./server-74nkyqEk.mjs";
import { n as Panel, t as PageFrame } from "./page-frame-GUKP_S0q.mjs";
import { t as Input } from "./input-D9dJgPsQ.mjs";
import { t as passwordIssues } from "./password-CqOEJuK1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-3zZDJJ5-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const [mode, setMode] = (0, import_react.useState)("in");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageFrame, {
		eyebrow: "Gate",
		title: mode === "in" ? "Sign in" : "Create account",
		lead: "Google, X, or email. Passwords are hashed. Use 12+ characters with a letter and a number.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			texture: "oak",
			className: "mx-auto max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: p.idp === "google" ? "default" : "stone",
						onClick: () => signIn(p.providerId, { callbackURL: "/account" }),
						children: ["Continue with ", p.label]
					}, p.providerId)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-1 text-center font-mono text-xs tracking-widest text-muted uppercase",
						children: "or email"
					}),
					mode === "in" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInForm, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignUpForm, { onDone: () => setMode("in") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-sm text-muted underline-offset-4 hover:text-foreground hover:underline",
						onClick: () => setMode(mode === "in" ? "up" : "in"),
						children: mode === "in" ? "Need an account? Create one" : "Already have one? Sign in"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-center text-sm text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "underline-offset-4 hover:text-foreground hover:underline",
					children: "Back to the world"
				})
			})]
		})
	});
}
function SignInForm() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			const { error } = await authClient.signIn.email({
				email: email.trim().toLowerCase(),
				password
			});
			if (error) {
				toast.error("Email or password is wrong.");
				return;
			}
			await authClient.getSession();
			toast.success("Signed in");
			await navigate({ to: "/account" });
		} catch {
			toast.error("Email or password is wrong.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3",
		onSubmit: (e) => void onSubmit(e),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "email",
				name: "email",
				autoComplete: "username",
				required: true,
				placeholder: "Email",
				value: email,
				onChange: (e) => setEmail(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "password",
				name: "password",
				autoComplete: "current-password",
				required: true,
				minLength: 8,
				placeholder: "Password",
				value: password,
				onChange: (e) => setPassword(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: busy,
				children: busy ? "Signing in…" : "Sign in with email"
			})
		]
	});
}
function SignUpForm({ onDone }) {
	const navigate = useNavigate();
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		const mail = email.trim().toLowerCase();
		const issues = passwordIssues(password, mail);
		if (password !== confirm) issues.push("Passwords do not match.");
		if (issues.length) {
			toast.error(issues[0]);
			return;
		}
		setBusy(true);
		try {
			const { error } = await authClient.signUp.email({
				email: mail,
				password,
				name: name.trim() || mail.split("@")[0]
			});
			if (error) {
				const msg = error.message?.toLowerCase() ?? "";
				if (msg.includes("exist") || msg.includes("already")) {
					toast.error("That email is already in use. Sign in instead.");
					onDone();
				} else toast.error("Could not create that account.");
				return;
			}
			await authClient.getSession();
			toast.success("Account created");
			await navigate({ to: "/account" });
		} catch {
			toast.error("Could not create that account.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3",
		onSubmit: (e) => void onSubmit(e),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "text",
				name: "name",
				autoComplete: "nickname",
				placeholder: "Display name",
				value: name,
				onChange: (e) => setName(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "email",
				name: "email",
				autoComplete: "username",
				required: true,
				placeholder: "Email",
				value: email,
				onChange: (e) => setEmail(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "password",
				name: "new-password",
				autoComplete: "new-password",
				required: true,
				minLength: 12,
				placeholder: `Password (12+ chars, letter + number)`,
				value: password,
				onChange: (e) => setPassword(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "password",
				name: "confirm-password",
				autoComplete: "new-password",
				required: true,
				minLength: 12,
				placeholder: "Confirm password",
				value: confirm,
				onChange: (e) => setConfirm(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "We store a hash, never the password. Keep Google or X as a backup so you do not lose the desk."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: busy,
				children: busy ? "Creating…" : "Create account"
			})
		]
	});
}
//#endregion
export { LoginPage as component };
