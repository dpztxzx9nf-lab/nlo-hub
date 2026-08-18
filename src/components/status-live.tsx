import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { getSnapshot } from "@/lib/nlo/server";
import type { LiveStatus } from "@/lib/nlo/server";
import { cn } from "@/lib/utils";

export type LiveName = { ign: string; uuid: string | null };

export type LiveWorld = {
  status: LiveStatus;
  online: LiveName[];
  at: number;
};

const POLL_MS = 2_000;

function parsePayload(data: unknown): Omit<LiveWorld, "at"> | null {
  if (!data || typeof data !== "object") return null;
  const rec = data as {
    status?: LiveStatus;
    online?: LiveName[];
    roster?: { ign: string; uuid: string | null; online?: boolean }[];
  };
  if (!rec.status) return null;
  const online =
    rec.online ??
    (rec.roster ?? [])
      .filter((p) => p.online)
      .map((p) => ({ ign: p.ign, uuid: p.uuid }));
  return { status: rec.status, online };
}

async function readWorld(): Promise<Omit<LiveWorld, "at"> | null> {
  try {
    const res = await fetch("/api/live", {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const parsed = parsePayload(await res.json());
      if (parsed) return parsed;
    }
  } catch {
    /* fall through to server fn */
  }
  try {
    const snap = await getSnapshot();
    return {
      status: snap.status,
      online: snap.onlineNames?.length
        ? snap.onlineNames.map((ign) => {
            const row = snap.roster.find((p) => p.ign.toLowerCase() === ign.toLowerCase());
            return { ign, uuid: row?.uuid ?? null };
          })
        : snap.roster.filter((p) => p.online).map((p) => ({ ign: p.ign, uuid: p.uuid })),
    };
  } catch {
    return null;
  }
}

type Listener = () => void;
const listeners = new Set<Listener>();
let latest: LiveWorld | null = null;
let timer: number | null = null;
let inflight = false;

function emit(next: LiveWorld) {
  latest = next;
  listeners.forEach((fn) => fn());
}

async function tick() {
  if (inflight) return;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
  inflight = true;
  try {
    const next = await readWorld();
    if (next) emit({ ...next, at: Date.now() });
  } finally {
    inflight = false;
  }
}

function startPolling() {
  if (timer != null) return;
  void tick();
  timer = window.setInterval(tick, POLL_MS);
  window.addEventListener("focus", tick);
  document.addEventListener("visibilitychange", tick);
}

function stopPolling() {
  if (listeners.size > 0) return;
  if (timer != null) {
    window.clearInterval(timer);
    timer = null;
  }
  window.removeEventListener("focus", tick);
  document.removeEventListener("visibilitychange", tick);
}

const EMPTY_STATUS: LiveStatus = {
  online: false,
  players: 0,
  max: 16,
  version: "26.2",
  motd: null,
  checked: false,
};

export function useLiveWorld(initial?: LiveStatus): LiveWorld {
  const [world, setWorld] = useState<LiveWorld>(() => ({
    status: initial ?? EMPTY_STATUS,
    online: [],
    at: 0,
  }));

  useEffect(() => {
    if (latest) setWorld(latest);
    const onChange = () => {
      if (latest) setWorld(latest);
    };
    listeners.add(onChange);
    startPolling();
    return () => {
      listeners.delete(onChange);
      stopPolling();
    };
  }, []);

  return world;
}

export function useLiveStatus(initial?: LiveStatus): LiveStatus {
  return useLiveWorld(initial).status;
}

function PulseDot({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "nlo-pulse inline-block size-1.5 shrink-0 rounded-full",
        on ? "bg-live-foreground" : "bg-current/70",
      )}
      aria-hidden
    />
  );
}

export function StatusLive({ status }: { status: LiveStatus }) {
  const live = useLiveStatus(status);
  if (!live.checked) {
    return (
      <Badge variant="oak">
        Checking world…
      </Badge>
    );
  }
  if (!live.online) {
    return <Badge variant="wanted">Offline</Badge>;
  }
  return (
    <Badge variant="live" className="gap-1.5">
      <PulseDot on />
      {live.players}/{live.max} online
    </Badge>
  );
}

export function LiveCount({ status }: { status: LiveStatus }) {
  const live = useLiveStatus(status);
  const prev = useRef(live.players);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prev.current !== live.players) {
      prev.current = live.players;
      setFlash(true);
      const id = window.setTimeout(() => setFlash(false), 500);
      return () => window.clearTimeout(id);
    }
  }, [live.players]);

  return <span className={cn(flash && "nlo-count-flash")}>{live.players}/{live.max}</span>;
}

export function HeaderLive() {
  const live = useLiveStatus();
  if (!live.checked) {
    return (
      <span className="hidden font-mono text-xs tracking-wide text-muted uppercase lg:inline">
        Checking…
      </span>
    );
  }
  return (
    <Link
      to="/roster"
      className={cn(
        "hidden items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-xs tracking-wide uppercase lg:inline-flex",
        live.online ? "text-accent" : "text-muted",
      )}
    >
      <span
        className={cn(
          "nlo-pulse inline-block size-1.5 rounded-full",
          live.online ? "bg-accent" : "bg-muted",
        )}
      />
      {live.online ? `${live.players}/${live.max}` : "Offline"}
    </Link>
  );
}
