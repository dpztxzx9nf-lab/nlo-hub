import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageFrame, Panel } from "@/components/page-frame";
import { PlayerFace } from "@/components/player-face";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getBounties, postBounty, type BountyRow } from "@/lib/nlo/server";
import { formatInt } from "@/lib/utils";

const siteRoute = getRouteApi("/_site");

export const Route = createFileRoute("/_site/bounties")({
  loader: () => getBounties(),
  component: BountiesPage,
});

function BountiesPage() {
  const initial = Route.useLoaderData();
  const [list, setList] = useState(initial);

  return (
    <PageFrame
      eyebrow="Hunt"
      title="Bounty board"
      lead="Funded names only. Coin leaves the poster’s purse when the claim is turned in."
    >
      <div className="mb-6 overflow-hidden rounded-lg">
        <img
          src="/world-raid.jpg"
          alt="Night village under raid weather"
          className="aspect-banner w-full object-cover"
        />
      </div>
      <PostForm
        onPosted={(row) => {
          if (row) setList((cur) => [row, ...cur]);
        }}
      />
      <ul className="mt-6 grid gap-3">
        {list.length === 0 ? (
          <li>
            <Panel>
              <p className="text-sm text-muted">
                No funded names yet. Sign in, claim your IGN, and post one.
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
              </div>
            </Panel>
          </li>
          ))
        )}
      </ul>
    </PageFrame>
  );
}

function PostForm({ onPosted }: { onPosted: (row: BountyRow | undefined) => void }) {
  const { session } = siteRoute.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const [target, setTarget] = useState("");
  const [reward, setReward] = useState("2500");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user && !session) {
    return (
      <Panel>
        <p className="text-muted">Sign in and claim your IGN to post a funded bounty.</p>
        <Button className="mt-3" asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      </Panel>
    );
  }
  if (isPending || !user) return <div className="h-40 animate-pulse rounded-lg bg-foreground/5" />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const row = await postBounty({
        data: { target, reward: Number(reward), reason },
      });
      onPosted(row);
      setTarget("");
      setReason("");
      toast.success("Bounty posted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not post bounty");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel texture="oak">
      <h2 className="text-2xl">Post a bounty</h2>
      <form className="mt-4 grid gap-3 md:grid-cols-[1fr_8rem_1fr_auto]" onSubmit={(e) => void submit(e)}>
        <Input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target IGN"
          required
        />
        <Input
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          type="number"
          min={500}
          max={100000}
          required
        />
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why they are on the board"
          required
        />
        <Button type="submit" disabled={busy}>
          Fund
        </Button>
      </form>
    </Panel>
  );
}
