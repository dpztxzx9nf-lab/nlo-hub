import { ignKey, isValidIgn } from "@/lib/nlo/grant-shared";

export type SeenName = {
  ign: string;
  uuid: string | null;
};

export type MinecraftIdentity = {
  ign: string;
  uuid: string | null;
  source: "online" | "seen" | "mojang";
};

export function dashedUuid(id: string): string {
  const hex = id.replace(/-/g, "").toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) return id;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Prefer currently-online names, then the rest of the seen roster. */
export function pickSeenIdentity(raw: string, players: SeenName[]): MinecraftIdentity | null {
  const key = ignKey(raw);
  if (!key) return null;
  const hit = players.find((player) => ignKey(player.ign) === key);
  if (!hit) return null;
  return {
    ign: hit.ign,
    uuid: hit.uuid,
    source: "seen",
  };
}

export async function lookupMojang(name: string): Promise<{ ign: string; uuid: string } | null> {
  const ign = name.trim();
  if (!isValidIgn(ign) || ign.startsWith(".")) return null;
  const url = `https://api.minecraftservices.com/minecraft/profile/lookup/name/${encodeURIComponent(ign)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8_000),
    cache: "no-store",
  });
  if (res.status === 404 || res.status === 204) return null;
  if (!res.ok) throw new Error("Could not verify that Minecraft name right now. Try again.");
  const data = (await res.json()) as { id?: string; name?: string };
  if (!data.id || !data.name || !isValidIgn(data.name)) return null;
  return { ign: data.name, uuid: dashedUuid(data.id) };
}

export async function resolveMinecraftIdentity(
  raw: string,
  players: SeenName[],
): Promise<MinecraftIdentity> {
  const trimmed = raw.trim();
  if (!isValidIgn(trimmed)) throw new Error("Use a Minecraft name.");
  const seen = pickSeenIdentity(trimmed, players);
  if (seen) {
    if (seen.uuid || trimmed.startsWith(".") || seen.ign.startsWith(".")) return seen;
    try {
      const mojang = await lookupMojang(seen.ign);
      if (mojang) {
        return { ign: seen.ign, uuid: mojang.uuid, source: "seen" };
      }
    } catch {
      /* keep the name the server already reported */
    }
    return seen;
  }
  if (trimmed.startsWith(".")) {
    throw new Error("Join nlo.gg on Bedrock first so we can bind that gamertag.");
  }
  const mojang = await lookupMojang(trimmed);
  if (!mojang) throw new Error("That isn't a real Java Minecraft username.");
  return { ign: mojang.ign, uuid: mojang.uuid, source: "mojang" };
}
