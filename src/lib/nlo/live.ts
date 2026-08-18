import { getSql } from "@/lib/db";

export type LiveStatus = {
  online: boolean;
  players: number;
  max: number;
  version: string | null;
  motd: string | null;
  checked: boolean;
};

export type SeenPlayer = {
  ign: string;
  uuid: string | null;
  first_seen: string;
  last_seen: string;
  seen_count: number;
  online: boolean;
};

export type WorldSnapshot = {
  status: LiveStatus;
  onlineNames: string[];
  roster: SeenPlayer[];
};

type McPlayer = {
  uuid?: string;
  name_clean?: string;
  name_raw?: string;
};

type McStatus = {
  online?: boolean;
  players?: {
    online?: number;
    max?: number;
    list?: McPlayer[];
  };
  version?: { name_clean?: string };
  motd?: { clean?: string };
};

const CACHE_MS = 15_000;
const LAST_GOOD_MS = 10 * 60_000;
const PING_HOSTS = ["nlo.gg", "5.78.90.11"];
const PING_MS = 8_000;

const globalRef = globalThis as typeof globalThis & {
  __nloSnapshot__?: { at: number; value: WorldSnapshot };
  __nloLastGood__?: { at: number; status: LiveStatus; sample: { ign: string; uuid: string | null }[] };
};

function emptyStatus(): LiveStatus {
  return {
    online: false,
    players: 0,
    max: 16,
    version: "26.2",
    motd: null,
    checked: false,
  };
}

async function pingOne(host: string): Promise<{
  status: LiveStatus;
  sample: { ign: string; uuid: string | null }[];
}> {
  const res = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`, {
    signal: AbortSignal.timeout(PING_MS),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const data = (await res.json()) as McStatus;
  const sample = (data.players?.list ?? [])
    .map((p) => {
      const ign = (p.name_clean || p.name_raw || "").trim();
      if (!ign) return null;
      return { ign, uuid: p.uuid ?? null };
    })
    .filter((p): p is { ign: string; uuid: string | null } => Boolean(p));
  const online = Boolean(data.online);
  const players = Number(data.players?.online);
  return {
    status: {
      online,
      players: Number.isFinite(players) ? players : sample.length,
      max: data.players?.max ?? 16,
      version: data.version?.name_clean ?? "26.2",
      motd: data.motd?.clean?.replace(/\s+/g, " ").trim() ?? null,
      checked: true,
    },
    sample,
  };
}

async function pingJava(): Promise<{
  status: LiveStatus;
  sample: { ign: string; uuid: string | null }[];
}> {
  let lastErr: unknown;
  for (const host of PING_HOSTS) {
    try {
      return await pingOne(host);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("status");
}

async function ensureSeenTable() {
  const sql = await getSql();
  await sql.query(`
    create table if not exists nlo_seen (
      ign text primary key,
      uuid text,
      first_seen timestamptz not null default now(),
      last_seen timestamptz not null default now(),
      seen_count integer not null default 1
    )
  `);
}

async function persistSample(sample: { ign: string; uuid: string | null }[]) {
  await ensureSeenTable();
  if (sample.length === 0) return;
  const sql = await getSql();
  for (const p of sample) {
    await sql`
      insert into nlo_seen (ign, uuid, first_seen, last_seen, seen_count)
      values (${p.ign}, ${p.uuid}, now(), now(), 1)
      on conflict (ign) do update set
        uuid = coalesce(excluded.uuid, nlo_seen.uuid),
        last_seen = now(),
        seen_count = nlo_seen.seen_count + case
          when nlo_seen.last_seen < now() - interval '5 minutes' then 1
          else 0
        end
    `;
  }
}

async function loadRoster(onlineNames: Set<string>): Promise<SeenPlayer[]> {
  await ensureSeenTable();
  const sql = await getSql();
  const rows = await sql<{
    ign: string;
    uuid: string | null;
    first_seen: string;
    last_seen: string;
    seen_count: number;
  }>`
    select ign, uuid, first_seen::text as first_seen, last_seen::text as last_seen, seen_count
    from nlo_seen
    order by last_seen desc, ign asc
  `;
  return rows.map((r) => ({
    ign: String(r.ign),
    uuid: r.uuid ? String(r.uuid) : null,
    first_seen: String(r.first_seen ?? ""),
    last_seen: String(r.last_seen ?? ""),
    seen_count: Number(r.seen_count) || 0,
    online: onlineNames.has(String(r.ign).toLowerCase()),
  }));
}

export async function getWorldSnapshot(): Promise<WorldSnapshot> {
  const empty: WorldSnapshot = { status: emptyStatus(), onlineNames: [], roster: [] };
  try {
    const cached = globalRef.__nloSnapshot__;
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.value;

    let status = emptyStatus();
    let sample: { ign: string; uuid: string | null }[] = [];
    try {
      const ping = await pingJava();
      status = ping.status;
      sample = ping.sample;
      globalRef.__nloLastGood__ = { at: Date.now(), status, sample };
      await persistSample(sample);
    } catch {
      const last = globalRef.__nloLastGood__;
      if (last && Date.now() - last.at < LAST_GOOD_MS) {
        status = last.status;
        sample = last.sample;
      } else {
        status = { ...emptyStatus(), checked: false };
      }
    }

    const onlineNames = new Set(sample.map((p) => p.ign.toLowerCase()));
    let roster: SeenPlayer[] = [];
    try {
      roster = await loadRoster(onlineNames);
    } catch {
      roster = sample.map((p) => ({
        ign: p.ign,
        uuid: p.uuid,
        first_seen: "",
        last_seen: "",
        seen_count: 1,
        online: true,
      }));
    }

    const value: WorldSnapshot = {
      status: {
        online: Boolean(status.online),
        players: Number(status.players) || 0,
        max: Number(status.max) || 16,
        version: status.version ? String(status.version) : null,
        motd: cleanMotd(status.motd),
        checked: Boolean(status.checked),
      },
      onlineNames: sample.map((p) => String(p.ign)),
      roster,
    };
    globalRef.__nloSnapshot__ = { at: Date.now(), value };
    return value;
  } catch {
    return empty;
  }
}

function cleanMotd(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/[§]./g, "")
    .replace(/I{3,}/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 8 ? cleaned : null;
}
