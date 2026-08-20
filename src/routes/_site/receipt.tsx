import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClaimIgnForm } from "@/components/claim-ign";
import { CoinFlow, coinFlowPhase } from "@/components/coin-flow";
import { CopyIp } from "@/components/copy-ip";
import { PageFrame, Panel } from "@/components/page-frame";
import { PlayerFace } from "@/components/player-face";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getClaimableNames,
  getPaidReceipt,
  type ClaimableName,
  type PaidReceipt,
} from "@/lib/nlo/server";
import { formatInt } from "@/lib/utils";

const siteRoute = getRouteApi("/_site");

function blankReceipt(sessionId: string, error: string): PaidReceipt {
  return {
    sessionId,
    paid: false,
    pending: false,
    packId: null,
    packName: null,
    coins: 0,
    usd: 0,
    already: false,
    signedIn: false,
    claimedIgn: null,
    grantStatus: null,
    plugin: false,
    error,
  };
}

export const Route = createFileRoute("/_site/receipt")({
  validateSearch: (search: Record<string, unknown>): { paid: string } => ({
    paid: typeof search.paid === "string" ? search.paid : "",
  }),
  loader: async ({ location }) => {
    const search = location.search as { paid?: string };
    const paid = typeof search.paid === "string" ? search.paid.trim() : "";
    if (!paid.startsWith("cs_")) {
      return { receipt: blankReceipt(paid, "No checkout on this page."), names: [] as ClaimableName[] };
    }
    try {
      const receipt = await getPaidReceipt({ data: paid });
      const names = receipt.signedIn ? await getClaimableNames().catch(() => [] as ClaimableName[]) : [];
      return { receipt, names };
    } catch {
      return {
        receipt: blankReceipt(paid, "Could not load that receipt. Refresh — the charge still went through if Stripe confirmed it."),
        names: [] as ClaimableName[],
      };
    }
  },
  head: () => ({
    meta: [{ title: "Paid — NLO" }],
  }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { receipt: initial, names } = Route.useLoaderData();
  const { session } = siteRoute.useLoaderData();
  const [receipt, setReceipt] = useState(initial);
  const signedIn = Boolean(receipt.signedIn || session);

  useEffect(() => {
    setReceipt(initial);
  }, [initial]);

  useEffect(() => {
    if (!receipt.pending) return;
    const t = window.setTimeout(() => window.location.reload(), 2500);
    return () => window.clearTimeout(t);
  }, [receipt.pending]);

  const phase = coinFlowPhase({
    signedIn,
    claimedIgn: receipt.claimedIgn,
    pendingCount: receipt.paid && receipt.grantStatus !== "delivered" ? 1 : 0,
    delivered: receipt.grantStatus === "delivered",
    seenNames: names.length > 0,
  });

  const title = receipt.paid ? "Paid" : receipt.pending ? "Confirming" : "Receipt";
  const lead = receipt.paid
    ? receipt.claimedIgn
      ? receipt.grantStatus === "delivered"
        ? `Those coins already landed for ${receipt.claimedIgn}.`
        : `Join as ${receipt.claimedIgn}. Coins land within a few seconds if you are already online.`
      : "Step 1 is done. Next: join nlo.gg as your Minecraft name, confirm your face, then coins land in-game."
    : receipt.pending
      ? "Stripe is still confirming. This page reloads itself."
      : "We could not match that checkout yet.";

  return (
    <PageFrame eyebrow="Receipt" title={title} lead={lead}>
      <Panel texture="oak" className="mx-auto max-w-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">Card checkout</p>
          <Badge variant={receipt.paid ? "gold" : receipt.pending ? "oak" : "wanted"}>
            {receipt.paid ? "Paid" : receipt.pending ? "Pending" : "Not found"}
          </Badge>
        </div>

        {receipt.packName || receipt.coins ? (
          <>
            <h2 className="mt-3 text-3xl">{receipt.packName ?? "Coin pack"}</h2>
            <p className="mt-2 font-display text-5xl tabular-nums">+{formatInt(receipt.coins)}</p>
            <p className="text-sm text-muted">coins{receipt.usd ? ` · $${receipt.usd}` : ""}</p>
          </>
        ) : null}

        {receipt.error ? <p className="mt-4 text-sm text-muted">{receipt.error}</p> : null}

        {receipt.paid ? (
          <div className="mt-5 rounded-sm bg-background/35 px-3 py-3">
            <CoinFlow phase={phase} ign={receipt.claimedIgn} showJoin={phase === "join" || phase === "collect"} />
          </div>
        ) : null}

        {receipt.paid && receipt.claimedIgn ? (
          <div className="mt-5 flex items-start gap-3 rounded-sm bg-background/35 px-3 py-3">
            <PlayerFace ign={receipt.claimedIgn} size={40} />
            <div>
              <p className="font-medium">Join as {receipt.claimedIgn}</p>
              <p className="mt-1 text-sm text-muted">
                {receipt.grantStatus === "delivered"
                  ? "Those coins already landed in-game."
                  : receipt.plugin === false
                    ? "Queued on this desk. They deposit once the live box pulls the grant."
                    : "They deposit on the next login, or within a few seconds if you are already online."}
              </p>
            </div>
          </div>
        ) : null}

        {receipt.paid && signedIn && !receipt.claimedIgn ? (
          <div className="mt-5 rounded-sm bg-background/35 px-3 py-3">
            <p className="font-mono text-xs tracking-widest text-accent uppercase">Step 3 — confirm your face</p>
            <p className="mt-2 text-sm text-muted">
              Coins stay on this desk until you confirm the Minecraft name you join nlo.gg with — not your real name.
            </p>
            <ClaimIgnForm
              names={names}
              onClaimed={(next) => setReceipt((prev) => ({ ...prev, claimedIgn: next, grantStatus: "pending" }))}
            />
          </div>
        ) : null}

        {receipt.paid && !signedIn ? (
          <div className="mt-5 rounded-sm bg-background/35 px-3 py-3">
            <p className="font-medium">Sign in to finish</p>
            <p className="mt-2 text-sm text-muted">
              The charge already went through. Sign in on this same desk, join nlo.gg, then confirm your face so coins land.
            </p>
            <Button className="mt-4" asChild>
              <a href={`/login?next=${encodeURIComponent(`/receipt?paid=${receipt.sessionId}`)}`}>Sign in</a>
            </Button>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <CopyIp />
          <Button variant="stone" asChild>
            <Link to="/play">How to join</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/shop">Back to shop</Link>
          </Button>
        </div>
      </Panel>
    </PageFrame>
  );
}
