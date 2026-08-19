import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageFrame, Panel } from "@/components/page-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
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

export const Route = createFileRoute("/_site/shop")({
  component: ShopPage,
});

function ShopPage() {
  const { user, isPending } = useCurrentUserState();
  const [coins, setCoins] = useState(0);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [desk, setDesk] = useState<GrantDesk>({
    claimedIgn: null,
    pendingCoins: 0,
    pendingCount: 0,
    deliveredCoins: 0,
    grants: [],
  });
  const [card, setCard] = useState(false);
  const [live, setLive] = useState(false);
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
      .then(([w, o, pay, grants]) => {
        if (cancelled) return;
        setCoins(w.coins);
        setOrders(o);
        setDesk(grants);
        setCard(pay.card);
        setLive(Boolean(pay.live));
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

  if (isPending) {
    return (
      <PageFrame eyebrow="Commerce" title="Coin shop">
        <div className="h-48 animate-pulse rounded-lg bg-foreground/5" />
      </PageFrame>
    );
  }
  if (!user) return <RedirectToSignIn />;

  async function pay(packId: (typeof COIN_PACKS)[number]["id"]) {
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
      lead="Pays by card through Stripe. After the charge, coins queue for your claimed Minecraft IGN and deposit into the live NLO economy."
    >
      <Panel texture="oak" className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-accent uppercase">Desk ledger</p>
            <p className="mt-1 font-display text-5xl tabular-nums">
              {ready ? formatInt(coins) : "—"}
            </p>
            <p className="mt-1 text-sm text-muted">
              {!card
                ? "Packs are listed. Card checkout turns on when Stripe is connected."
                : live
                  ? "Real card charges. Stripe takes the payment — we never see the number. Coins then queue for your claimed IGN."
                  : "Stripe is still in test mode. No real money moves until a live secret key is installed."}
            </p>
          </div>
          <Button variant="stone" asChild>
            <Link to="/account">Manage account</Link>
          </Button>
        </div>
        <CoinDeliveryPanel desk={desk} ready={ready} />
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
              <Button
                variant={pack.id === "chest" || pack.id === "netherite" ? "default" : "oak"}
                disabled={busy !== null}
                onClick={() => setConfirm(pack)}
              >
                Buy
              </Button>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-6">
        <h2 className="text-2xl">Receipts</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No paid packs yet.</p>
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
              <Button disabled={busy !== null} onClick={() => void pay(confirm.id)}>
                {busy ? "Opening Stripe…" : card ? `Pay $${confirm.usd}` : "Checkout not connected"}
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
