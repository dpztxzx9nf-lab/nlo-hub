import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageFrame, Panel } from "@/components/page-frame";
import { PlayerFace } from "@/components/player-face";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getPlayer, toggleWatch } from "@/lib/nlo/server";
import { formatWhen } from "@/lib/utils";

export const Route = createFileRoute("/_site/roster/$ign")({
  loader: async ({ params }) => getPlayer({ data: params.ign }),
  component: ProfilePage,
});

function ProfilePage() {
  const player = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const [busy, setBusy] = useState(false);

  if (!player) {
    return (
      <PageFrame eyebrow="Missing" title="Not on the ledger">
        <p className="text-muted">That name is not a valid Minecraft name.</p>
        <Button className="mt-4" asChild>
          <Link to="/roster">Back to roster</Link>
        </Button>
      </PageFrame>
    );
  }

  const seen = player.seen_count > 0;

  async function watch() {
    if (!user || !player) return;
    setBusy(true);
    try {
      const res = await toggleWatch({ data: player.ign });
      toast.success(res.watching ? `Watching ${player.ign}` : `Dropped ${player.ign}`);
    } catch {
      toast.error("Sign in to watch a player");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageFrame eyebrow={seen ? "Seen on nlo.gg" : "Unknown"} title={player.ign}>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Panel texture="oak">
          <div className="flex flex-col items-center text-center">
            <PlayerFace ign={player.ign} uuid={player.uuid} size={96} />
            <p className="mt-3 font-display text-3xl">{player.ign}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {player.online ? <Badge variant="live">Online</Badge> : <Badge>Offline</Badge>}
              {seen ? <Badge variant="oak">Ledger</Badge> : <Badge variant="wanted">Unseen</Badge>}
            </div>
            {!isPending && user ? (
              <div className="mt-4 grid w-full gap-2">
                <Button variant="stone" disabled={busy} onClick={() => void watch()}>
                  Watch
                </Button>
                {seen ? (
                  <Button asChild>
                    <Link to="/bounties" search={{ target: player.ign }}>
                      Put a bounty on them
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : (
              <Button className="mt-4 w-full" variant="stone" asChild>
                <Link to="/login">Sign in to watch</Link>
              </Button>
            )}
          </div>
        </Panel>
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Status" value={player.online ? "Online" : "Offline"} />
          <Stat label="Last seen" value={seen ? formatWhen(player.last_seen) : "Never"} />
          <Stat label="First seen" value={seen ? formatWhen(player.first_seen) : "Never"} />
          <Stat label="Sightings" value={String(player.seen_count)} />
          <Panel className="sm:col-span-2">
            <p className="font-mono text-xs tracking-widest text-muted uppercase">UUID</p>
            <p className="mt-2 break-all font-mono text-sm text-muted">
              {player.uuid ?? "Not reported by the server yet."}
            </p>
            <p className="mt-3 text-sm text-muted">
              {seen
                ? "Prestige and coins will land here when the server exposes them."
                : "This name has not shown up on nlo.gg since the ledger started watching."}
            </p>
          </Panel>
        </div>
      </div>
    </PageFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Panel>
      <p className="font-mono text-xs tracking-widest text-muted uppercase">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums">{value}</p>
    </Panel>
  );
}
