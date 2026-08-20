import { createFileRoute } from "@tanstack/react-router";
import { PageFrame, Panel } from "@/components/page-frame";
import { Badge } from "@/components/ui/badge";
import { getIntel } from "@/lib/nlo/server";

export const Route = createFileRoute("/_site/intel")({
  loader: () => getIntel(),
  component: IntelPage,
});

function IntelPage() {
  const items = Route.useLoaderData();

  return (
    <PageFrame
      eyebrow="Dispatches"
      title="Intel"
      lead="Patch notes, market hours, and whatever Quill wrote down before someone raided the library."
    >
      <div className="grid gap-3">
        {items.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted">No dispatches yet. Check Discord if you need a ruling now.</p>
          </Panel>
        ) : (
          items.map((item) => (
            <Panel key={item.id} texture={item.kind === "patch" ? "stone" : "oak"}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={item.kind === "event" ? "gold" : "oak"}>{item.kind}</Badge>
                <span className="font-mono text-xs text-faint">
                  {item.posted_at.slice(0, 10)}
                </span>
              </div>
              <h2 className="mt-3 text-2xl">{item.title}</h2>
              <p className="mt-2 text-muted">{item.body}</p>
            </Panel>
          ))
        )}
      </div>
    </PageFrame>
  );
}
