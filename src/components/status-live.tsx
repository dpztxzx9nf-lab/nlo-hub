import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { LiveStatus } from "@/lib/nlo/server";

type McStatus = {
  online?: boolean;
  players?: { online?: number; max?: number };
  version?: { name_clean?: string };
  motd?: { clean?: string };
};

async function pingBrowser(): Promise<LiveStatus | null> {
  for (const host of ["nlo.gg", "5.78.90.11"]) {
    try {
      const res = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as McStatus;
      const players = Number(data.players?.online);
      return {
        online: Boolean(data.online),
        players: Number.isFinite(players) ? players : 0,
        max: data.players?.max ?? 16,
        version: data.version?.name_clean ?? "26.2",
        motd: data.motd?.clean ?? null,
        checked: true,
      };
    } catch {
      /* try next host */
    }
  }
  return null;
}

export function useLiveStatus(initial: LiveStatus): LiveStatus {
  const [status, setStatus] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const next = await pingBrowser();
      if (!cancelled && next) setStatus(next);
    }
    void refresh();
    const id = window.setInterval(refresh, 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return status;
}

export function StatusLive({ status }: { status: LiveStatus }) {
  const live = useLiveStatus(status);
  if (!live.checked) {
    return (
      <Badge variant="oak">
        Status unknown · Java {live.version ?? "26.2"}
      </Badge>
    );
  }
  if (!live.online) {
    return <Badge variant="wanted">Offline</Badge>;
  }
  return (
    <Badge variant="live">
      {live.players}/{live.max} online
    </Badge>
  );
}

export function LiveCount({ status }: { status: LiveStatus }) {
  const live = useLiveStatus(status);
  return <>{live.players}/{live.max}</>;
}
