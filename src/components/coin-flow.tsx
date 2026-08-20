import { Link } from "@tanstack/react-router";
import { CopyIp } from "@/components/copy-ip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CoinFlowPhase = "buy" | "join" | "confirm" | "collect" | "done";

const STEPS: { id: Exclude<CoinFlowPhase, "done">; title: string; detail: string }[] = [
  {
    id: "buy",
    title: "Buy a pack",
    detail: "Pay with a card. Coins wait on this desk — they are not in your inventory yet.",
  },
  {
    id: "join",
    title: "Join nlo.gg",
    detail: "Use the Minecraft username you play as. Not your real name.",
  },
  {
    id: "confirm",
    title: "Confirm your face",
    detail: "Tap your name, check the skin, then hit Yes, this is me.",
  },
  {
    id: "collect",
    title: "Stay online or log in again",
    detail: "Coins land on that account within a few seconds.",
  },
];

const ORDER: CoinFlowPhase[] = ["buy", "join", "confirm", "collect", "done"];

export function coinFlowPhase({
  signedIn,
  claimedIgn,
  pendingCount = 0,
  delivered = false,
  seenNames = false,
}: {
  signedIn: boolean;
  claimedIgn: string | null;
  pendingCount?: number;
  delivered?: boolean;
  seenNames?: boolean;
}): CoinFlowPhase {
  if (claimedIgn) {
    if (delivered && pendingCount === 0) return "done";
    if (pendingCount > 0) return "collect";
    return "done";
  }
  if (!signedIn) return "buy";
  if (pendingCount > 0) return seenNames ? "confirm" : "join";
  return "buy";
}

export function CoinFlow({
  phase,
  ign = null,
  showJoin = false,
}: {
  phase: CoinFlowPhase;
  ign?: string | null;
  showJoin?: boolean;
}) {
  const current = phase === "done" ? STEPS.length : ORDER.indexOf(phase);
  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-accent uppercase">How coins get to you</p>
      <ol className="mt-3 grid gap-3">
        {STEPS.map((step, i) => {
          const state = i < current ? "done" : i === current ? "now" : "todo";
          const detail =
            step.id === "collect" && ign
              ? `Join as ${ign}. Coins land within a few seconds if you are already online.`
              : step.detail;
          return (
            <li key={step.id} className="flex gap-3">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-sm font-mono mc-bevel",
                  state === "now" && "tex-grass text-accent-foreground",
                  state === "done" && "tex-oak text-foreground",
                  state === "todo" && "tex-stone text-muted",
                )}
              >
                {i + 1}
              </span>
              <div>
                <p className={cn("font-medium", state === "now" && "text-foreground", state === "todo" && "text-muted")}>
                  {step.title}
                  {state === "now" ? <span className="ml-2 font-mono text-xs tracking-widest text-accent uppercase">Now</span> : null}
                </p>
                <p className="text-sm text-muted">{detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {showJoin && (phase === "join" || phase === "collect") ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <CopyIp />
          <Button variant="stone" asChild>
            <Link to="/play">How to join</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
