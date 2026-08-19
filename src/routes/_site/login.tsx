import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageFrame, Panel } from "@/components/page-frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { PASSWORD_MIN, passwordIssues } from "@/lib/auth/password";

export const Route = createFileRoute("/_site/login")({
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"in" | "up">("in");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const err = q.get("error");
    if (!err || err === "undefined") return;
    if (err === "access_denied") {
      toast.error("Sign-in was canceled. Try again, or use email.");
      return;
    }
    toast.error("That sign-in did not finish. Try the other button, or use email.");
  }, []);

  return (
    <PageFrame
      eyebrow="Gate"
      title={mode === "in" ? "Sign in" : "Create account"}
      lead="Google, X, or email — same desk. Passwords are hashed. Use 12+ characters with a letter and a number."
    >
      <Panel texture="oak" className="mx-auto max-w-md">
        {authEnabled ? (
          <div className="grid gap-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant={p.idp === "google" ? "default" : "stone"}
                onClick={() =>
                  signIn(p.providerId, { callbackURL: "/account", errorCallbackURL: "/login" })
                }
              >
                Continue with {p.label}
              </Button>
            ))}
            <p className="py-1 text-center font-mono text-xs tracking-widest text-muted uppercase">
              or email
            </p>
            {mode === "in" ? <SignInForm /> : <SignUpForm onDone={() => setMode("in")} />}
            <button
              type="button"
              className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => setMode(mode === "in" ? "up" : "in")}
            >
              {mode === "in" ? "Need an account? Create one" : "Already have one? Sign in"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled on this instance.</p>
        )}
        <p className="mt-4 text-center text-sm text-muted">
          <Link to="/" className="underline-offset-4 hover:text-foreground hover:underline">
            Back to the world
          </Link>
        </p>
      </Panel>
    </PageFrame>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
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

  return (
    <form className="grid gap-3" onSubmit={(e) => void onSubmit(e)}>
      <Input
        type="email"
        name="email"
        autoComplete="username"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        name="password"
        autoComplete="current-password"
        required
        minLength={8}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in with email"}
      </Button>
    </form>
  );
}

function SignUpForm({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
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
        name: name.trim() || mail.split("@")[0],
      });
      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        if (msg.includes("exist") || msg.includes("already")) {
          toast.error("That email is already in use. Sign in instead.");
          onDone();
        } else {
          toast.error("Could not create that account.");
        }
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

  return (
    <form className="grid gap-3" onSubmit={(e) => void onSubmit(e)}>
      <Input
        type="text"
        name="name"
        autoComplete="nickname"
        placeholder="Display name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        type="email"
        name="email"
        autoComplete="username"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        name="new-password"
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN}
        placeholder={`Password (${PASSWORD_MIN}+ chars, letter + number)`}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        type="password"
        name="confirm-password"
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN}
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      <p className="text-xs text-muted">
        We store a hash, never the password. Keep Google or X as a backup so you
        do not lose the desk.
      </p>
      <Button type="submit" disabled={busy}>
        {busy ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
