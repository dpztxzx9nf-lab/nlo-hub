import { createFileRoute } from "@tanstack/react-router";
import { PageFrame, Panel } from "@/components/page-frame";
import { RULES } from "@/lib/nlo/content";

export const Route = createFileRoute("/_site/rules")({
  component: RulesPage,
});

function RulesPage() {
  return (
    <PageFrame
      eyebrow="Fair play"
      title="The rules are short"
      lead="Conflict is the game. Cheats are not. If it is outside protected spawn, assume someone can take it."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {RULES.map((block) => (
          <Panel key={block.title} texture={block.title.startsWith("Conflict") ? "oak" : "stone"}>
            <h2 className="text-2xl">{block.title}</h2>
            <ul className="mt-4 grid gap-3 text-sm text-muted">
              {block.items.map((item) => (
                <li key={item} className="border-l-2 border-accent/60 pl-3">
                  {item}
                </li>
              ))}
            </ul>
          </Panel>
        ))}
      </div>
    </PageFrame>
  );
}
