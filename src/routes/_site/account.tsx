import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClaimIgnForm } from "@/components/claim-ign";
import { CoinDeliveryPanel } from "@/components/coin-delivery";
import { PageFrame, Panel } from "@/components/page-frame";
import { PlayerFace } from "@/components/player-face";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authClient } from "@/lib/auth/client";
import { PASSWORD_MIN, passwordIssues } from "@/lib/auth/password";
import { emptyGrantDesk } from "@/lib/nlo/grant-shared";
import {
  getClaimableNames,
  getGrantDesk,
  getPayStatus,
  getWallet,
  getWatch,
  type ClaimableName,
  type GrantDesk,
} from "@/lib/nlo/server";
import { formatInt } from "@/lib/utils";

const siteRoute = getRouteApi("/_site");

export const Route = createFileRoute("/_site/account")({
  component: AccountPage,
});

function AccountPage() {
  const { session } = siteRoute.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const signedIn = Boolean(user || session);
  const [claimed, setClaimed] = useState<string | null>(null);
  const [watch, setWatch] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [desk, setDesk] = useState<GrantDesk>(emptyGrantDesk());
  const [names, setNames] = useState<ClaimableName[]>([]);
  const [ready, setReady] = useState(false);
  const [plugin, setPlugin] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    void Promise.all([getWatch(), getWallet(), getGrantDesk(), getPayStatus(), getClaimableNames()])
      .then(([w, wallet, grants, pay, claimable]) => {
        if (cancelled) return;
        setClaimed(grants.claimedIgn);
        setWatch(w.map((row) => row.ign));
        setCoins(wallet.coins);
        setDesk(grants);
        setNames(claimable);
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

  if (!signedIn) {
    return (
      <PageFrame
        eyebrow="Desk"
        title="Your desk"
        lead="Sign in to verify the Minecraft name you join with, read the coin ledger, and watch names on the roster."
      >
        <Panel texture="oak" className="mx-auto max-w-md">
          <p className="text-sm text-muted">
            Shop packs queue for the verified IGN on this desk and deposit into the live NLO economy.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/login">Sign in</Link>
          </Button>
        </Panel>
      </PageFrame>
    );
  }

  if (!user) {
    return (
      <PageFrame eyebrow="Desk" title="Your desk">
        <div className="h-48 animate-pulse rounded-lg bg-foreground/5" />
      </PageFrame>
    );
  }

  function onClaimed(next: string) {
    setClaimed(next);
    setDesk((prev) => ({
      ...prev,
      claimedIgn: next,
      grants: prev.grants.map((g) =>
        g.status === "pending" || g.status === "delivering" ? { ...g, ign: next } : g,
      ),
    }));
  }

  return (
    <PageFrame
      eyebrow="Desk"
      title={user.displayName ?? "Player desk"}
      lead="Verify the IGN you join nlo.gg with. Shop coins only deposit to that in-game account."
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
          <h2 className="text-2xl">Verify IGN</h2>
          <p className="mt-2 text-sm text-muted">
            Java names must be real Mojang accounts that have joined. Bedrock names must already be
            online or on the roster, including the leading dot.
          </p>
          <ClaimIgnForm initial={claimed ?? ""} names={names} onClaimed={onClaimed} />
          {claimed ? (
            <div className="mt-4 flex items-center gap-3">
              <PlayerFace ign={claimed} size={40} />
              <p className="text-sm text-muted">
                Verified in-game account <span className="text-foreground">{claimed}</span>
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">
              Join nlo.gg, then claim the exact name the server shows.
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
