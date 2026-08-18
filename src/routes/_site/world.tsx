import { createFileRoute } from "@tanstack/react-router";
import { PageFrame, Panel } from "@/components/page-frame";
import { WORLD_PILLARS } from "@/lib/nlo/content";

export const Route = createFileRoute("/_site/world")({
  component: WorldPage,
});

function WorldPage() {
  return (
    <PageFrame
      eyebrow="The map"
      title="A living SMP"
      lead="HD grass, a market that never sleeps, and a creative world where you buy plots to show off builds. Survival does not reset with the season."
    >
      <div className="grid gap-4">
        {WORLD_PILLARS.map((p) => (
          <Panel key={p.title} texture="oak">
            <div className="grid gap-4 md:grid-cols-2 md:items-center">
              <img src={p.image} alt="" className="aspect-photo w-full rounded-sm object-cover" />
              <div>
                <h2 className="text-3xl">{p.title}</h2>
                <p className="mt-3 text-muted">{p.body}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </PageFrame>
  );
}
