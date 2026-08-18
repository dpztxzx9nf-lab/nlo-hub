import net from "node:net";

export type SlpSample = { ign: string; uuid: string | null };

export type SlpResult = {
  players: number;
  max: number;
  version: string | null;
  motd: string | null;
  sample: SlpSample[];
};

function writeVarInt(value: number): Buffer {
  const bytes: number[] = [];
  let n = value >>> 0;
  while (true) {
    if ((n & ~0x7f) === 0) {
      bytes.push(n);
      break;
    }
    bytes.push((n & 0x7f) | 0x80);
    n >>>= 7;
  }
  return Buffer.from(bytes);
}

function writeString(value: string): Buffer {
  const body = Buffer.from(value, "utf8");
  return Buffer.concat([writeVarInt(body.length), body]);
}

function writeUShort(value: number): Buffer {
  const buf = Buffer.alloc(2);
  buf.writeUInt16BE(value);
  return buf;
}

function packet(id: number, ...parts: Buffer[]): Buffer {
  const body = Buffer.concat([writeVarInt(id), ...parts]);
  return Buffer.concat([writeVarInt(body.length), body]);
}

function readVarInt(buf: Buffer, offset: number): { value: number; offset: number } {
  let value = 0;
  let shift = 0;
  while (offset < buf.length) {
    const byte = buf[offset++];
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return { value, offset };
    shift += 7;
    if (shift > 35) throw new Error("varint");
  }
  throw new Error("short");
}

function flattenMotd(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(flattenMotd).join("");
  if (typeof node === "object") {
    const rec = node as { text?: unknown; extra?: unknown; translate?: unknown };
    const parts = [typeof rec.text === "string" ? rec.text : ""];
    if (typeof rec.translate === "string") parts.push(rec.translate);
    if (rec.extra) parts.push(flattenMotd(rec.extra));
    return parts.join("");
  }
  return "";
}

function parseSlpJson(raw: string): SlpResult {
  const data = JSON.parse(raw) as {
    version?: { name?: string };
    players?: {
      online?: number;
      max?: number;
      sample?: { name?: string; id?: string }[];
    };
    description?: unknown;
  };
  const sample = (data.players?.sample ?? [])
    .map((p) => {
      const ign = String(p.name ?? "").trim();
      if (!ign) return null;
      return { ign, uuid: p.id ? String(p.id) : null };
    })
    .filter((p): p is SlpSample => Boolean(p));
  const players = Number(data.players?.online);
  return {
    players: Number.isFinite(players) ? players : sample.length,
    max: Number(data.players?.max) || 16,
    version: data.version?.name ?? null,
    motd: flattenMotd(data.description).replace(/\s+/g, " ").trim() || null,
    sample,
  };
}

export function pingSlp(host: string, port = 25565, timeoutMs = 2500): Promise<SlpResult> {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    let buf = Buffer.alloc(0);
    let settled = false;

    const finish = (err?: Error, value?: SlpResult) => {
      if (settled) return;
      settled = true;
      sock.destroy();
      if (err) reject(err);
      else resolve(value as SlpResult);
    };

    sock.setTimeout(timeoutMs);
    sock.on("connect", () => {
      const handshake = packet(
        0x00,
        writeVarInt(767),
        writeString(host),
        writeUShort(port),
        writeVarInt(1),
      );
      sock.write(Buffer.concat([handshake, packet(0x00)]));
    });
    sock.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      try {
        const len = readVarInt(buf, 0);
        if (buf.length < len.offset + len.value) return;
        const id = readVarInt(buf, len.offset);
        if (id.value !== 0x00) {
          finish(new Error("packet"));
          return;
        }
        const str = readVarInt(buf, id.offset);
        if (buf.length < str.offset + str.value) return;
        const json = buf.subarray(str.offset, str.offset + str.value).toString("utf8");
        finish(undefined, parseSlpJson(json));
      } catch (err) {
        if (err instanceof Error && err.message === "short") return;
        finish(err instanceof Error ? err : new Error("slp"));
      }
    });
    sock.on("timeout", () => finish(new Error("timeout")));
    sock.on("error", (err) => finish(err));
    sock.on("close", () => {
      if (!settled) finish(new Error("closed"));
    });
  });
}

export const SLP_TARGETS: { host: string; port: number; timeout: number }[] = [
  { host: "127.0.0.1", port: 25565, timeout: 350 },
  { host: "5.78.90.11", port: 25565, timeout: 2500 },
  { host: "nlo.gg", port: 25565, timeout: 2500 },
];

export async function pingNloSlp(): Promise<SlpResult> {
  let lastErr: unknown;
  for (const target of SLP_TARGETS) {
    try {
      return await pingSlp(target.host, target.port, target.timeout);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("slp");
}
