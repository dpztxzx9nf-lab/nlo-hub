import { createFileRoute } from "@tanstack/react-router";
import { CopyConsoleFriend, CopyIp } from "@/components/copy-ip";
import { PageFrame, Panel } from "@/components/page-frame";
import { StatusLive } from "@/components/status-live";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JOIN_STEPS, SERVER } from "@/lib/nlo/content";
import { getLiveStatus } from "@/lib/nlo/server";

export const Route = createFileRoute("/_site/play")({
  loader: () => getLiveStatus(),
  component: PlayPage,
});

function PlayPage() {
  const status = Route.useLoaderData();

  return (
    <PageFrame
      eyebrow="Connect"
      title="Join the world"
      lead="Native Java is 26.2. Phone and Windows Bedrock use the IP. Consoles add Minecraft friend NLO#3114 — they are still Bedrock."
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusLive status={status} />
        <Badge>Java {SERVER.version}</Badge>
        <Badge variant="oak">{SERVER.compat}</Badge>
        <Badge variant="oak">Bedrock {SERVER.bedrockPort}</Badge>
        <CopyIp />
        <CopyConsoleFriend />
        <Button variant="stone" asChild>
          <a href={SERVER.discord} target="_blank" rel="noreferrer">
            Discord first
          </a>
        </Button>
      </div>

      <Panel texture="oak" className="mb-6">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Version</p>
        <h2 className="mt-2 text-2xl">Java {SERVER.version} first</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          The world runs on Minecraft Java {SERVER.version}. {SERVER.compat} lets some older
          Java versions in. Bedrock on phone or Windows uses {SERVER.ip}:{SERVER.bedrockPort}.
          Xbox, PlayStation, and Switch cannot add that address — add friend{" "}
          {SERVER.consoleFriend} and join from the friend list.
        </p>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel texture="oak">
          <h2 className="text-3xl">Java</h2>
          <p className="mt-1 text-sm text-muted">Multiplayer → Add Server → {SERVER.ip}</p>
          <ol className="mt-5 grid gap-4">
            {JOIN_STEPS.java.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-sm tex-grass font-mono text-accent-foreground mc-bevel">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel>
          <h2 className="text-3xl">Bedrock</h2>
          <p className="mt-1 text-sm text-muted">
            Phone and Windows · {SERVER.ip}:{SERVER.bedrockPort}
          </p>
          <ol className="mt-5 grid gap-4">
            {JOIN_STEPS.bedrock.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-sm tex-stone font-mono mc-bevel">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel texture="oak">
          <h2 className="text-3xl">Console</h2>
          <p className="mt-1 text-sm text-muted">
            Still Bedrock. Add friend {SERVER.consoleFriend}.
          </p>
          <ol className="mt-5 grid gap-4">
            {JOIN_STEPS.console.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-sm tex-grass font-mono text-accent-foreground mc-bevel">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-sm text-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-5">
            <CopyConsoleFriend variant="default" />
          </div>
        </Panel>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg">
        <img
          src="/spawn-plaza.jpg"
          alt="NLO spawn plaza in stone brick and oak"
          className="aspect-banner w-full object-cover"
        />
      </div>
    </PageFrame>
  );
}
