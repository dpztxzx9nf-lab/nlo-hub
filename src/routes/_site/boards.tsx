import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageFrame, Panel } from "@/components/page-frame";
import { PlayerFace } from "@/components/player-face";
import { StatusLive, applyLiveRoster, useLiveWorld } from "@/components/status-live";
import { Badge } from "@/components/ui/badge";
import type { SeenPlayer } from "@/lib/nlo/server";
import { getRoster, getLiveStatus } from "@/lib/nlo/server";
import { cn, formatWhen } from "@/lib/utils";

const TABS = [
  { id: "online", label: "Online" },
  { id: "recent", label: "Last seen" },
  { id: "sighted", label: "Most seen" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export const Route = createFileRoute("/_site/boards")({
  loader: async () => {
    const [roster, status] = await Promise.all([getRoster(), getLiveStatus()]);
    return { roster, status };
  },
  component: BoardsPage,
});

function BoardsPage() {
  const { roster, status } = Route.useLoaderData();
  const live = useLiveWorld(status);
  const [tab, setTab] = useState<Tab>("online");

  const merged = useMemo(() => applyLiveRoster(roster, live), [roster, live]);

  const rows = useMemo(() => {
    const copy = [...merged];
    if (tab === "online") {
      copy.sort((a, b) => Number(b.online) - Number(a.online) || b.last_seen.localeCompare(a.last_seen));
    }
    if (tab === "recent") copy.sort((a, b) => b.last_seen.localeCompare(a.last_seen));
    if (tab === "sighted") copy.sort((a, b) => b.seen_count - a.seen_count);
    return tab === "online" ? copy.filter((p) => p.online) : copy;
  }, [merged, tab]);

  return (
    <PageFrame
      eyebrow="Ledger"
      title="Sightings"
      lead="Who the world has seen. Online names update as people join."
    >
      <div className="mb-4">
        <StatusLive status={status} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "min-h-11 rounded-sm px-4 font-display text-base mc-bevel",
              tab === t.id ? "bg-accent text-accent-foreground" : "tex-oak text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Panel>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">
            {tab === "online"
              ? "Nobody online right now. Check Last seen."
              : "The ledger is empty until someone joins nlo.gg."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-lg text-left text-sm">
              <thead className="font-mono text-xs tracking-widest text-muted uppercase">
                <tr>
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Player</th>
                  <th className="py-2 pr-3">Last seen</th>
                  <th className="py-2 text-right">Sightings</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
                  <BoardRow key={p.ign} p={p} rank={i + 1} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </PageFrame>
  );
}

function BoardRow({ p, rank }: { p: SeenPlayer; rank: number }) {
  return (
    <tr className="border-t border-line">
      <td className="py-3 pr-3 font-mono text-faint tabular-nums">{rank}</td>
      <td className="py-3 pr-3">
        <Link
          to="/roster/$ign"
          params={{ ign: p.ign }}
          className="flex items-center gap-2 font-medium hover:text-accent"
        >
          <PlayerFace ign={p.ign} uuid={p.uuid} size={28} />
          {p.ign}
          {p.online ? <Badge variant="live">On</Badge> : null}
        </Link>
      </td>
      <td className="py-3 pr-3 text-muted">{p.online ? "Now" : formatWhen(p.last_seen)}</td>
      <td className="py-3 text-right font-mono tabular-nums">{p.seen_count}</td>
    </tr>
  );
}
