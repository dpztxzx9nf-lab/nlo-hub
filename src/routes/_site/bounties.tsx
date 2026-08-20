import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ClaimIgnForm } from "@/components/claim-ign";
import { PageFrame, Panel } from "@/components/page-frame";
import { PlayerFace } from "@/components/player-face";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BOUNTY_MAX, BOUNTY_MIN } from "@/lib/nlo/content";
import { ignsMatch } from "@/lib/nlo/grant-shared";
import {
  dropBounty,
  getBounties,
  getClaim,
  getClaimableNames,
  getWallet,
  postBounty,
  type BountyRow,
  type ClaimableName,
} from "@/lib/nlo/server";
import { formatInt } from "@/lib/utils";

const siteRoute = getRouteApi("/_site");

export const Route = createFileRoute("/_site/bounties")({
  validateSearch: (search: Record<string, unknown>): { target?: string } => ({
    target: typeof search.target === "string" && search.target.trim() ? search.target.trim() : undefined,
  }),
  loader: () => getBounties(),
  component: BountiesPage,
});

function BountiesPage() {
  const initial = Route.useLoaderData();
  const { target: preset } = Route.useSearch();
  const [list, setList] = useState(initial);
  const { session } = siteRoute.useLoaderData();
  const { user } = useCurrentUserState();
  const [claimed, setClaimed] = useState<string | null>(null);

  useEffect(() => {
    if (!user && !session) return;
    void getClaim()
      .then((name) => setClaimed(name))
      .catch(() => setClaimed(null));
  }, [user, session]);

  return (
    <PageFrame
      eyebrow="Hunt"
      title="Bounty board"
      lead={`Funded names only. ${formatInt(BOUNTY_MIN)} coins leave this desk when you post. A $1 Pebble covers one hunt.`}
    >
      <div className="mb-6 overflow-hidden rounded-lg">
        <img
          src="/world-raid.jpg"
          alt="Night village under raid weather"
          className="aspect-banner w-full object-cover"
        />
      </div>
      <PostForm
        preset={preset}
        claimed={claimed}
        onClaimed={setClaimed}
        onPosted={(row) => {
          if (row) setList((cur) => [row, ...cur.filter((item) => item.id !== row.id)]);
        }}
      />
      <ul className="mt-6 grid gap-3">
        {list.length === 0 ? (
          <li>
            <Panel>
              <p className="text-sm text-muted">
                No funded names yet. Buy a pack, confirm the Minecraft name you join
                with, then put 500 coins on someone the server has seen.
              </p>
            </Panel>
          </li>
        ) : (
          list.map((b) => (
            <li key={b.id}>
              <Panel texture={b.status === "open" ? "oak" : "stone"}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <PlayerFace ign={b.target_ign} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/roster/$ign"
                        params={{ ign: b.target_ign }}
                        className="font-display text-2xl hover:text-accent"
                      >
                        {b.target_ign}
                      </Link>
                      <Badge variant={b.status === "open" ? "wanted" : "oak"}>{b.status}</Badge>
                      <Badge variant="gold">{formatInt(b.reward)} coins</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">{b.reason}</p>
                    <p className="mt-1 font-mono text-xs text-faint">Posted by {b.posted_by}</p>
                  </div>
                  {b.status === "open" && claimed && ignsMatch(claimed, b.posted_by) ? (
                    <TakeDown
                      id={b.id}
                      onDropped={(row) =>
                        setList((cur) => cur.map((item) => (item.id === row.id ? row : item)))
                      }
                    />
                  ) : null}
                </div>
              </Panel>
            </li>
          ))
        )}
      </ul>
    </PageFrame>
  );
}

function TakeDown({ id, onDropped }: { id: number; onDropped: (row: BountyRow) => void }) {
  const [busy, setBusy] = useState(false);
  async function drop() {
    setBusy(true);
    try {
      const row = await dropBounty({ data: id });
      onDropped(row);
      toast.success("Hunt taken down. Coins returned to this desk.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not take that down");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Button type="button" variant="stone" disabled={busy} onClick={() => void drop()}>
      {busy ? "Returning…" : "Take down"}
    </Button>
  );
}

function PostForm({
  preset,
  claimed,
  onClaimed,
  onPosted,
}: {
  preset?: string;
  claimed: string | null;
  onClaimed: (ign: string) => void;
  onPosted: (row: BountyRow | undefined) => void;
}) {
  const { session } = siteRoute.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const [target, setTarget] = useState(preset ?? "");
  const [reward, setReward] = useState(String(BOUNTY_MIN));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [coins, setCoins] = useState(0);
  const [names, setNames] = useState<ClaimableName[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (preset) setTarget(preset);
  }, [preset]);

  useEffect(() => {
    if (isPending || !user) return;
    let cancelled = false;
    void Promise.all([getWallet(), getClaimableNames()])
      .then(([wallet, claimable]) => {
        if (cancelled) return;
        setCoins(wallet.coins);
        setNames(claimable);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isPending, user]);

  if (!user && !session) {
    return (
      <Panel>
        <p className="text-muted">
          Sign in and confirm the Minecraft name you join with to post a funded bounty.
        </p>
        <Button className="mt-3" asChild>
          <a href={`/login?next=${encodeURIComponent("/bounties")}`}>Sign in</a>
        </Button>
      </Panel>
    );
  }
  if (isPending || !user) return <div className="h-40 animate-pulse rounded-lg bg-foreground/5" />;

  const marks = names.filter((row) => !ignsMatch(claimed, row.ign)).slice(0, 16);
  const online = marks.filter((row) => row.online);
  const recent = marks.filter((row) => !row.online).slice(0, 8);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const row = await postBounty({
        data: { target, reward: Number(reward), reason },
      });
      onPosted(row);
      setCoins((cur) => Math.max(0, cur - Number(reward)));
      setTarget("");
      setReason("");
      setReward(String(BOUNTY_MIN));
      toast.success(`${formatInt(Number(reward))} coins left this desk. The hunt is up.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post bounty");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel texture="oak">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl">Post a bounty</h2>
        <p className="font-mono text-sm tabular-nums text-muted">
          Desk {ready ? formatInt(coins) : "—"}
        </p>
      </div>
      {!claimed ? (
        <>
          <p className="mt-3 text-sm text-muted">
            Confirm the Minecraft name you join with. Then 500 coins from this desk put a name on the board.
          </p>
          <ClaimIgnForm names={names} onClaimed={onClaimed} />
        </>
      ) : coins < BOUNTY_MIN ? (
        <>
          <p className="mt-3 text-sm text-muted">
            Need {formatInt(BOUNTY_MIN)} coins on this desk. A $1 Pebble funds one hunt.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/shop">Buy coins</Link>
          </Button>
        </>
      ) : (
        <form className="mt-4 grid gap-3" onSubmit={(e) => void submit(e)}>
          <Input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target Minecraft name"
            required
          />
          {online.length > 0 ? (
            <NamePicks label="Online now" rows={online} onPick={setTarget} selected={target} />
          ) : null}
          {recent.length > 0 ? (
            <NamePicks label="Recently on nlo.gg" rows={recent} onPick={setTarget} selected={target} />
          ) : null}
          <div className="grid gap-3 md:grid-cols-[8rem_1fr_auto]">
            <Input
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              type="number"
              min={BOUNTY_MIN}
              max={Math.min(BOUNTY_MAX, Math.max(BOUNTY_MIN, coins))}
              required
              aria-label="Reward coins"
            />
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why they are on the board"
              required
              minLength={8}
              maxLength={180}
            />
            <Button type="submit" disabled={busy}>
              {busy ? "Funding…" : "Fund"}
            </Button>
          </div>
          <p className="font-mono text-xs text-faint">
            Min {formatInt(BOUNTY_MIN)} · those coins leave this desk now
          </p>
        </form>
      )}
    </Panel>
  );
}

function NamePicks({
  label,
  rows,
  onPick,
  selected,
}: {
  label: string;
  rows: ClaimableName[];
  onPick: (ign: string) => void;
  selected: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-muted uppercase">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {rows.map((row) => (
          <button
            key={row.ign}
            type="button"
            onClick={() => onPick(row.ign)}
            className={`flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm ${
              ignsMatch(selected, row.ign) ? "bg-foreground/20 text-foreground" : "bg-background/40 hover:bg-background/70"
            }`}
          >
            <PlayerFace ign={row.ign} uuid={row.uuid} size={22} />
            {row.ign}
          </button>
        ))}
      </div>
    </div>
  );
}
