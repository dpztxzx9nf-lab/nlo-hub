import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageFrame, Panel } from "@/components/page-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { COIN_PACKS } from "@/lib/nlo/content";
import { CoinDeliveryPanel } from "@/components/coin-delivery";
import {
  fulfillCheckout,
  getGrantDesk,
  getOrders,
  getPayStatus,
  getWallet,
  startCheckout,
  type GrantDesk,
  type OrderRow,
} from "@/lib/nlo/server";
import { deliveryToast } from "@/lib/nlo/grant-shared";
import { formatInt, formatWhen } from "@/lib/utils";

const siteRoute = getRouteApi("/_site");

export const Route = createFileRoute("/_site/shop")({
  loader: async () => ({ pay: await getPayStatus() }),
  component: ShopPage,
});

function ShopPage() {
  const { pay } = Route.useLoaderData();
  const { session } = siteRoute.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const signedIn = Boolean(user || session);
  const [coins, setCoins] = useState(0);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [desk, setDesk] = useState<GrantDesk>({
    claimedIgn: null,
    pendingCoins: 0,
    pendingCount: 0,
    deliveredCoins: 0,
    grants: [],
  });
  const [card, setCard] = useState(pay.card);
  const [live, setLive] = useState(Boolean(pay.live));
  const [webhook, setWebhook] = useState(Boolean(pay.webhook));
  const [plugin, setPlugin] = useState(Boolean(pay.plugin));
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<(typeof COIN_PACKS)[number] | null>(null);
  const [paidId, setPaidId] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search);
    const paid = q.get("paid");
    if (paid) setPaidId(paid);
    if (q.get("cancel") === "1") setCanceled(true);
  }, []);

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    void Promise.all([getWallet(), getOrders(), getPayStatus(), getGrantDesk()])
      .then(([w, o, nextPay, grants]) => {
        if (cancelled) return;
        setCoins(w.coins);
        setOrders(o);
        setDesk(grants);
        setCard(nextPay.card);
        setLive(Boolean(nextPay.live));
        setWebhook(Boolean(nextPay.webhook));
        setPlugin(Boolean(nextPay.plugin));
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isPending, user]);

  useEffect(() => {
    if (!user || !paidId) return;
    let cancelled = false;
    setBusy("paid");
    void fulfillCheckout({ data: paidId })
      .then((res) => {
        if (cancelled) return;
        setCoins(res.wallet.coins);
        setOrders((prev) => {
          const next = [res.order, ...prev.filter((o) => o.id !== res.order.id)];
          return next.slice(0, 20);
        });
        setDesk((prev) => {
          const grant = res.grant;
          const grants = [grant, ...prev.grants.filter((g) => g.id !== grant.id)].slice(0, 20);
          const open = grants.filter((g) => g.status === "pending" || g.status === "delivering");
          const done = grants.filter((g) => g.status === "delivered");
          return {
            claimedIgn: grant.ign ?? prev.claimedIgn,
            pendingCoins: open.reduce((sum, g) => sum + g.coins, 0),
            pendingCount: open.length,
            deliveredCoins: done.reduce((sum, g) => sum + g.coins, 0),
            grants,
          };
        });
        toast.success(res.already ? "That pack is already on this desk." : deliveryToast(res.grant));
      })
      .catch((err) => {
        if (!cancelled) toast.error(err instanceof Error ? err.message : "Could not confirm payment");
      })
      .finally(() => {
        if (!cancelled) setBusy(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user, paidId]);

  useEffect(() => {
    if (canceled) toast.message("Checkout canceled. No charge.");
  }, [canceled]);

  async function payPack(packId: (typeof COIN_PACKS)[number]["id"]) {
    if (!card) {
      toast.error("Card checkout is not connected yet.");
      return;
    }
    setBusy(packId);
    try {
      const { url } = await startCheckout({
        data: { packId, origin: window.location.origin },
      });
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setBusy(null);
    }
  }

  return (
    <PageFrame
      eyebrow="Commerce"
      title="Buy coins"
      lead={
        !card
          ? "Pays by card through Stripe once keys are on this desk. After a charge, coins queue for your claimed Minecraft IGN."
          : live
            ? "Pays by card through Stripe. After the charge, coins queue for your claimed Minecraft IGN and deposit into the live NLO economy."
            : "Packs are listed. Stripe is in test mode on this desk — no real charges until live keys are on. After a test pay, coins still queue for your claimed IGN."
      }
    >
      <Panel texture="oak" className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-accent uppercase">Desk ledger</p>
            <p className="mt-1 font-display text-5xl tabular-nums">
              {signedIn && ready ? formatInt(coins) : signedIn ? "—" : "0"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {!signedIn
                ? !card
                  ? "Sign in to buy a pack. Coins queue for your claimed IGN and land in the live NLO economy."
                  : live
                    ? "Sign in to buy a pack. Coins queue for your claimed IGN and land in the live NLO economy."
                    : "Sign in to try a pack. Checkout is Stripe test mode — no real money moves yet."
                : !card
                  ? "Packs are listed. Card checkout turns on when Stripe is connected."
                  : !live
                    ? "Stripe is still in test mode. No real money moves until a live secret key is installed."
                    : webhook
                      ? "Real card charges. Stripe confirms even if you close the tab, then coins queue for your claimed IGN."
                      : "Real card charges. Return to this page after Stripe so we can credit the pack."}
            </p>
          </div>
          {signedIn ? (
            <Button variant="stone" asChild>
              <Link to="/account">Manage account</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login">Sign in to buy</Link>
            </Button>
          )}
        </div>
        {signedIn ? (
          <CoinDeliveryPanel desk={desk} ready={ready} plugin={plugin} />
        ) : null}
      </Panel>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {COIN_PACKS.map((pack) => (
          <Panel key={pack.id} texture={pack.id === "netherite" ? "oak" : undefined}>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-2xl">{pack.name}</h2>
              {"tag" in pack && pack.tag ? <Badge variant="gold">{pack.tag}</Badge> : null}
            </div>
            <p className="mt-3 font-display text-4xl tabular-nums">{formatInt(pack.coins)}</p>
            <p className="text-sm text-muted">coins</p>
            <p className="mt-3 text-sm text-muted">{pack.blurb}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="font-mono text-sm">${pack.usd}</span>
              {signedIn ? (
                <Button
                  variant={pack.id === "chest" || pack.id === "netherite" ? "default" : "oak"}
                  disabled={busy !== null}
                  onClick={() => setConfirm(pack)}
                >
                  Buy
                </Button>
              ) : (
                <Button
                  variant={pack.id === "chest" || pack.id === "netherite" ? "default" : "oak"}
                  asChild
                >
                  <Link to="/login">Sign in to buy</Link>
                </Button>
              )}
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-6">
        <h2 className="text-2xl">Receipts</h2>
        {!signedIn ? (
          <p className="mt-3 text-sm text-muted">Sign in to see paid packs on this desk.</p>
        ) : orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{ready ? "No paid packs yet." : "Loading receipts…"}</p>
        ) : (
          <ul className="mt-4 grid gap-2">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-background/35 px-3 py-3"
              >
                <span className="font-medium capitalize">{o.pack_id}</span>
                <span className="font-mono text-sm tabular-nums">+{formatInt(o.coins)}</span>
                <span className="text-sm text-muted">${o.usd}</span>
                <span className="font-mono text-xs text-faint">{formatWhen(o.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-faint">
          NLO coins are game currency. No cash-out. Sales are final except where law requires.
        </p>
      </Panel>

      {confirm ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-background/70 p-4 sm:place-items-center">
          <Panel texture="oak" className="w-full max-w-md">
            <p className="font-mono text-xs tracking-widest text-accent uppercase">Card checkout</p>
            <h2 className="mt-2 text-3xl">{confirm.name}</h2>
            <p className="mt-3 text-sm text-muted">
              {formatInt(confirm.coins)} coins for ${confirm.usd}.{" "}
              {live
                ? "This is a real charge. After it succeeds, coins queue for your claimed IGN."
                : "Stripe test mode — 4242 cards work, no real charge. After payment, coins still queue for your claimed IGN."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button disabled={busy !== null || !user} onClick={() => void payPack(confirm.id)}>
                {busy ? "Opening Stripe…" : !user ? "Signing in…" : card ? `Pay $${confirm.usd}` : "Checkout not connected"}
              </Button>
              <Button variant="stone" disabled={busy !== null} onClick={() => setConfirm(null)}>
                Cancel
              </Button>
            </div>
          </Panel>
        </div>
      ) : null}
    </PageFrame>
  );
}
