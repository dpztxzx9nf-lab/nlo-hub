import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageFrame } from "@/components/page-frame";
import { PlayerFace } from "@/components/player-face";
import { applyLiveRoster, useLiveWorld } from "@/components/status-live";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getRoster } from "@/lib/nlo/server";
import { formatWhen } from "@/lib/utils";

const siteRoute = getRouteApi("/_site");

export const Route = createFileRoute("/_site/roster")({
  loader: () => getRoster(),
  component: RosterPage,
});

function RosterPage() {
  const roster = Route.useLoaderData();
  const { status } = siteRoute.useLoaderData();
  const live = useLiveWorld(status);
  const [q, setQ] = useState("");
  const merged = useMemo(() => {
    return applyLiveRoster(roster, live).sort(
      (a, b) => Number(b.online) - Number(a.online) || a.ign.localeCompare(b.ign),
    );
  }, [roster, live]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return merged;
    return merged.filter((p) => p.ign.toLowerCase().includes(s));
  }, [q, merged]);

  return (
    <PageFrame
      eyebrow="Players"
      title="Who the server has seen"
      lead="Join nlo.gg and you land here."
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a name"
        className="mb-5 max-w-md"
      />
      {filtered.length === 0 ? (
        <p className="text-muted">
          {merged.length === 0
            ? "The ledger is empty until someone joins nlo.gg."
            : "No one by that name on the ledger."}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.ign}>
              <Link
                to="/roster/$ign"
                params={{ ign: p.ign }}
                className="tex-stone flex items-center gap-3 rounded-lg p-1 mc-bevel"
              >
                <div className="flex flex-1 items-center gap-3 rounded-md bg-background/55 p-3">
                  <PlayerFace ign={p.ign} uuid={p.uuid} size={48} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-xl leading-none">{p.ign}</p>
                      {p.online ? <Badge variant="live">On</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {p.online ? "Online now" : `Last seen ${formatWhen(p.last_seen)}`}
                      {" · "}
                      seen {p.seen_count}×
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageFrame>
  );
}
