import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Swords, Trophy, Wallet } from "lucide-react";
import { CopyIp } from "@/components/copy-ip";
import { PlayerFace } from "@/components/player-face";
import { StatusLive } from "@/components/status-live";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/page-frame";
import { FEATURES, SERVER } from "@/lib/nlo/content";
import { getBounties, getSnapshot } from "@/lib/nlo/server";
import { formatInt, formatWhen } from "@/lib/utils";

export const Route = createFileRoute("/_site/")({
  loader: async () => {
    const [snap, bounties] = await Promise.all([getSnapshot(), getBounties()]);
    return {
      status: snap.status,
      motd: snap.status.motd,
      online: snap.roster.filter((p) => p.online),
      recent: snap.roster.slice(0, 8),
      openBounties: bounties.filter((b) => b.status === "open").slice(0, 4),
    };
  },
  component: Home,
});

function Home() {
  const { status, online, recent, openBounties } = Route.useLoaderData();

  return (
    <div>
      <section className="relative min-h-[78vh] overflow-hidden">
        <img
          src="/hero-plains.jpg"
          alt="NLO plains at golden hour — HD grass, oak house, dirt path"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-background/15" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pt-24 pb-12">
          <div className="flex flex-wrap items-center gap-2">
            <StatusLive status={status} />
            <Badge>Java {SERVER.version}</Badge>
            <Badge variant="oak">{SERVER.season}</Badge>
          </div>
          <h1 className="mt-4 max-w-3xl text-6xl leading-none sm:text-8xl">NLO</h1>
          <p className="mt-2 font-display text-xl text-accent sm:text-2xl">{SERVER.fullName}</p>
          <p className="mt-4 max-w-xl text-lg text-foreground/90">
            An open survival SMP. Build, trade, raid, and hunt bounties on one
            shared world — plus a creative world where you buy plots and show
            off builds.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <CopyIp size="lg" />
            <Button variant="oak" size="lg" asChild>
              <Link to="/play">
                How to join
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="stone" size="lg" asChild>
              <a href={SERVER.discord} target="_blank" rel="noreferrer">
                Discord
              </a>
            </Button>
          </div>
          <p className="mt-4 font-mono text-sm text-muted">
            {SERVER.ip} · Java {SERVER.version} · Bedrock {SERVER.bedrockPort} · Console{" "}
            {SERVER.consoleFriend}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:grid-cols-3">
        <Stat icon={Swords} label="Open conflict" value="Outside spawn" />
        <Stat icon={Wallet} label="Economy" value="AH + player shops" />
        <Stat icon={Trophy} label="On now" value={`${status.players}/${status.max}`} />
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 md:grid-cols-3">
        {FEATURES.map((f) => (
          <Link key={f.title} to={f.href} className="group block">
            <Panel>
              <div className="overflow-hidden rounded-sm">
                <img
                  src={f.image}
                  alt=""
                  className="aspect-photo w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <h2 className="mt-4 text-2xl">{f.title}</h2>
              <p className="mt-2 text-sm text-muted">{f.body}</p>
            </Panel>
          </Link>
        ))}
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-4 px-4 lg:grid-cols-2">
        <Panel texture="oak">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xs tracking-widest text-accent uppercase">Live</p>
              <h2 className="text-3xl">On the world</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/roster">Roster</Link>
            </Button>
          </div>
          {online.length === 0 && recent.length === 0 ? (
            <p className="mt-5 text-sm text-muted">
              Nobody on the ledger yet. Join {SERVER.ip} and you will appear here.
            </p>
          ) : online.length === 0 ? (
            <div className="mt-5">
              <p className="text-sm text-muted">Empty right now. Last seen:</p>
              <ol className="mt-3 grid gap-2">
                {recent.slice(0, 5).map((p) => (
                  <PlayerLine key={p.ign} ign={p.ign} uuid={p.uuid} meta={formatWhen(p.last_seen)} />
                ))}
              </ol>
            </div>
          ) : (
            <ol className="mt-5 grid gap-2">
              {online.map((p) => (
                <PlayerLine key={p.ign} ign={p.ign} uuid={p.uuid} meta="Online" live />
              ))}
            </ol>
          )}
        </Panel>

        <Panel>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xs tracking-widest text-accent uppercase">Hunt</p>
              <h2 className="text-3xl">Open bounties</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/bounties">Board</Link>
            </Button>
          </div>
          {openBounties.length === 0 ? (
            <p className="mt-5 text-sm text-muted">
              No funded names yet. Sign in, claim your IGN, and post one.
            </p>
          ) : (
            <ul className="mt-5 grid gap-3">
              {openBounties.map((b) => (
                <li key={b.id} className="flex items-start gap-3 rounded-sm bg-background/35 p-3">
                  <PlayerFace ign={b.target_ign} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{b.target_ign}</p>
                      <Badge variant="gold">{formatInt(b.reward)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">{b.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function PlayerLine({
  ign,
  uuid,
  meta,
  live,
}: {
  ign: string;
  uuid: string | null;
  meta: string;
  live?: boolean;
}) {
  return (
    <li>
      <Link
        to="/roster/$ign"
        params={{ ign }}
        className="flex items-center gap-3 rounded-sm px-2 py-2 hover:bg-background/40"
      >
        <PlayerFace ign={ign} uuid={uuid} size={32} />
        <span className="flex-1 font-medium">{ign}</span>
        {live ? <Badge variant="live">On</Badge> : null}
        <span className="font-mono text-xs text-muted">{meta}</span>
      </Link>
    </li>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Swords;
  label: string;
  value: string;
}) {
  return (
    <div className="tex-oak rounded-lg p-1 mc-bevel">
      <div className="flex items-center gap-3 rounded-md bg-background/50 px-4 py-4">
        <Icon className="size-5 text-accent" />
        <div>
          <p className="font-mono text-xs tracking-widest text-muted uppercase">{label}</p>
          <p className="font-display text-xl">{value}</p>
        </div>
      </div>
    </div>
  );
}
