import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageFrame, Panel } from "@/components/page-frame";
import { PlayerFace } from "@/components/player-face";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { CoinDeliveryPanel } from "@/components/coin-delivery";
import { getClaim, getGrantDesk, getPayStatus, getWallet, getWatch, saveClaim, type GrantDesk } from "@/lib/nlo/server";
import { authClient } from "@/lib/auth/client";
import { PASSWORD_MIN, passwordIssues } from "@/lib/auth/password";
import { formatInt } from "@/lib/utils";

export const Route = createFileRoute("/_site/account")({
  component: AccountPage,
});

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  const [ign, setIgn] = useState("");
  const [claimed, setClaimed] = useState<string | null>(null);
  const [watch, setWatch] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [desk, setDesk] = useState<GrantDesk>({
    claimedIgn: null,
    pendingCoins: 0,
    pendingCount: 0,
    deliveredCoins: 0,
    grants: [],
  });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [plugin, setPlugin] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    void Promise.all([getClaim(), getWatch(), getWallet(), getGrantDesk(), getPayStatus()])
      .then(([c, w, wallet, grants, pay]) => {
        if (cancelled) return;
        setClaimed(c);
        setIgn(c ?? "");
        setWatch(w.map((row) => row.ign));
        setCoins(wallet.coins);
        setDesk(grants);
        setPlugin(Boolean(pay.plugin));
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isPending, user]);

  if (isPending) {
    return (
      <PageFrame eyebrow="Desk" title="Your desk">
        <div className="h-48 animate-pulse rounded-lg bg-foreground/5" />
      </PageFrame>
    );
  }
  if (!user) return <RedirectToSignIn />;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const next = await saveClaim({ data: ign });
      setClaimed(next);
      setDesk((prev) => ({
        ...prev,
        claimedIgn: next,
        grants: prev.grants.map((g) =>
          g.status === "pending" || g.status === "delivering" ? { ...g, ign: next } : g,
        ),
      }));
      toast.success(
        desk.pendingCount > 0
          ? `Claimed ${next}. ${desk.pendingCoins.toLocaleString()} coins will deliver in-game.`
          : `Claimed ${next}`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not claim that name");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageFrame
      eyebrow="Desk"
      title={user.displayName ?? "Player desk"}
      lead="Claim the IGN you play under. Shop coins queue for that name and deposit into the live NLO economy."
    >
      <Panel texture="oak" className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-accent uppercase">Coins</p>
            <p className="mt-1 font-display text-5xl tabular-nums">
              {ready ? formatInt(coins) : "—"}
            </p>
            <p className="mt-1 text-sm text-muted">Desk ledger. Gameplay spending uses the in-game balance.</p>
          </div>
          <Button asChild>
            <Link to="/shop">Buy coins</Link>
          </Button>
        </div>
        <CoinDeliveryPanel desk={{ ...desk, claimedIgn: claimed }} ready={ready} plugin={plugin} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel texture="oak">
          <h2 className="text-2xl">Claim IGN</h2>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => void save(e)}>
            <Input
              value={ign}
              onChange={(e) => setIgn(e.target.value)}
              placeholder="Your Minecraft name"
              required
            />
            <Button type="submit" disabled={busy || !ready}>
              Save
            </Button>
          </form>
          {claimed ? (
            <div className="mt-4 flex items-center gap-3">
              <PlayerFace ign={claimed} size={40} />
              <p className="text-sm text-muted">
                Shop coins and watches use <span className="text-foreground">{claimed}</span>
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Claim your Minecraft IGN so coins can be delivered in-game.
            </p>
          )}
        </Panel>
        <Panel>
          <h2 className="text-2xl">Watchlist</h2>
          {!ready ? (
            <div className="mt-3 h-16 animate-pulse rounded-sm bg-foreground/5" />
          ) : watch.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No names yet. Open a roster card and hit Watch.</p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {watch.map((name) => (
                <li key={name}>
                  <Link
                    to="/roster/$ign"
                    params={{ ign: name }}
                    className="flex items-center gap-2 rounded-sm px-2 py-2 hover:bg-background/40"
                  >
                    <PlayerFace ign={name} size={28} />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <ChangePassword email={user.primaryEmail ?? ""} />
    </PageFrame>
  );
}

function ChangePassword({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
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
        revokeOtherSessions: true,
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

  return (
    <Panel className="mt-4">
      <h2 className="text-2xl">Password</h2>
      <p className="mt-2 text-sm text-muted">
        Changing it signs out every other device. There is no email reset — keep
        Google or X as a backup, or write the password down offline.
      </p>
      <form className="mt-4 grid gap-3 sm:max-w-md" onSubmit={(e) => void onSubmit(e)}>
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="Current password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
        <Input
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN}
          placeholder={`New password (${PASSWORD_MIN}+ chars)`}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
        />
        <Input
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN}
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <Button type="submit" variant="stone" disabled={busy}>
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Panel>
  );
}
