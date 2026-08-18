import { createFileRoute, Link } from "@tanstack/react-router";
import { PageFrame, Panel } from "@/components/page-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CHALLENGES, PRIZES, SERVER } from "@/lib/nlo/content";

export const Route = createFileRoute("/_site/season")({
  component: SeasonPage,
});

function SeasonPage() {
  const started = new Date(`${SERVER.seasonStart}T00:00:00Z`);
  const days = Math.max(1, Math.floor((Date.now() - started.getTime()) / 86_400_000));

  return (
    <PageFrame
      eyebrow={SERVER.season}
      title="Play for the close"
      lead="Top player takes $20 — cloak, skin, Minecoins, gift card, or a split. Top clan pays 25,000 coins to every member."
    >
      <div className="mb-6 overflow-hidden rounded-lg">
        <img
          src="/world-hills.jpg"
          alt="Lush NLO hills with HD grass and a river"
          className="aspect-banner w-full object-cover"
        />
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {PRIZES.map((p) => (
          <Panel key={p.place} texture="oak">
            <p className="font-mono text-xs tracking-widest text-accent uppercase">{p.place}</p>
            <h2 className="mt-2 text-3xl">{p.title}</h2>
            <p className="mt-3 text-sm text-muted">{p.body}</p>
            <p className="mt-4 font-mono text-xs text-faint">{p.note}</p>
          </Panel>
        ))}
      </div>

      <Panel className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest text-muted uppercase">Day {days}</p>
            <h2 className="text-3xl">Season track</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="default" asChild>
              <Link to="/boards">Boards</Link>
            </Button>
            <Button variant="stone" asChild>
              <Link to="/bounties">Bounties</Link>
            </Button>
          </div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-sm bg-background/60 mc-inset">
          <div className="tex-grass h-full w-3/5" />
        </div>
        <p className="mt-2 font-mono text-xs text-muted">
          How we rank #1 is still being written. Show up. The purse waits.
        </p>
      </Panel>

      <div className="grid gap-3 md:grid-cols-2">
        {CHALLENGES.map((c) => (
          <Panel key={c.title}>
            <div className="flex items-center justify-between gap-2">
              <Badge variant={c.cadence === "Season" ? "gold" : "oak"}>{c.cadence}</Badge>
              <span className="font-mono text-xs text-muted">{c.reward}</span>
            </div>
            <h3 className="mt-3 text-2xl">{c.title}</h3>
            <p className="mt-2 text-sm text-muted">{c.detail}</p>
          </Panel>
        ))}
      </div>
    </PageFrame>
  );
}
