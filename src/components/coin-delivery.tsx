import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { type GrantDesk } from "@/lib/nlo/grant-shared";
import { formatInt } from "@/lib/utils";

export function CoinDeliveryPanel({
  desk,
  ready,
  plugin,
}: {
  desk: GrantDesk;
  ready: boolean;
  plugin?: boolean;
}) {
  const ign = desk.claimedIgn;
  const waiting = !ign && desk.pendingCount > 0;
  const queued = Boolean(ign) && desk.pendingCount > 0;
  const boxDown = queued && plugin === false;
  return (
    <div className="mt-4 rounded-sm bg-background/35 px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">In-game delivery</p>
        {ready ? (
          <Badge variant={queued ? "gold" : waiting ? "wanted" : "oak"}>
            {waiting ? "Needs IGN" : boxDown ? "Queued" : queued ? "Pending" : desk.deliveredCoins > 0 ? "Delivered" : ign ? "Verified" : "Ready"}
          </Badge>
        ) : null}
      </div>
      {!ready ? (
        <div className="mt-2 h-10 animate-pulse rounded-sm bg-foreground/5" />
      ) : waiting ? (
        <p className="mt-2 text-sm text-muted">
          {formatInt(desk.pendingCoins)} coins are waiting.{" "}
          <Link to="/account" className="text-foreground underline">
            Confirm the Minecraft name you join with
          </Link>{" "}
          so coins deposit in-game.
        </p>
      ) : boxDown ? (
        <p className="mt-2 text-sm text-muted">
          {formatInt(desk.pendingCoins)} coins are queued for{" "}
          <span className="text-foreground">{ign}</span>. The live Paper box is not pulling
          grants yet — they land once NLOCoins is running on that box.
        </p>
      ) : queued ? (
        <p className="mt-2 text-sm text-muted">
          {formatInt(desk.pendingCoins)} coins queued for{" "}
          <span className="text-foreground">{ign}</span>. Join nlo.gg with that exact name —
          they land on the next login or within a few seconds if you are already online.
        </p>
      ) : ign ? (
        <p className="mt-2 text-sm text-muted">
          Shop coins deposit to verified IGN <span className="text-foreground">{ign}</span> in
          the NLO economy. Desk balance is the receipt ledger.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Confirm the Minecraft name you join with so coins can be delivered in-game.
        </p>
      )}
    </div>
  );
}
