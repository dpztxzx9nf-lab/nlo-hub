import net from "node:net";

const TYPE_RESPONSE = 0;
const TYPE_COMMAND = 2;
const TYPE_LOGIN = 3;

export function rconConfigured(): boolean {
  const enabled = process.env.NLO_RCON_ENABLED?.trim().toLowerCase();
  if (enabled !== "1" && enabled !== "true") return false;
  return Boolean(process.env.NLO_RCON_PASSWORD?.trim());
}

export function rconSettings() {
  return {
    host: process.env.NLO_RCON_HOST?.trim() || "127.0.0.1",
    port: Number(process.env.NLO_RCON_PORT) || 25575,
    password: process.env.NLO_RCON_PASSWORD?.trim() || "",
  };
}

function packet(id: number, type: number, body: string): Buffer {
  const payload = Buffer.from(body, "utf8");
  const length = 4 + 4 + payload.length + 2;
  const buf = Buffer.alloc(4 + length);
  buf.writeInt32LE(length, 0);
  buf.writeInt32LE(id, 4);
  buf.writeInt32LE(type, 8);
  payload.copy(buf, 12);
  buf.writeInt8(0, 12 + payload.length);
  buf.writeInt8(0, 13 + payload.length);
  return buf;
}

function readPackets(buf: Buffer): { id: number; type: number; body: string; rest: Buffer }[] {
  const out: { id: number; type: number; body: string; rest: Buffer }[] = [];
  let offset = 0;
  while (offset + 4 <= buf.length) {
    const length = buf.readInt32LE(offset);
    if (length < 10 || offset + 4 + length > buf.length) break;
    const id = buf.readInt32LE(offset + 4);
    const type = buf.readInt32LE(offset + 8);
    const body = buf.subarray(offset + 12, offset + 4 + length - 2).toString("utf8");
    offset += 4 + length;
    out.push({ id, type, body, rest: buf.subarray(offset) });
  }
  if (out.length) out[out.length - 1]!.rest = buf.subarray(offset);
  return out;
}

export async function rconCommand(command: string, timeoutMs = 4000): Promise<string> {
  const { host, port, password } = rconSettings();
  if (!password) throw new Error("RCON is not configured.");
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    let buf: Buffer = Buffer.alloc(0);
    let authed = false;
    let settled = false;
    const finish = (err?: Error, value?: string) => {
      if (settled) return;
      settled = true;
      sock.destroy();
      if (err) reject(err);
      else resolve(value ?? "");
    };
    sock.setTimeout(timeoutMs);
    sock.on("connect", () => {
      sock.write(packet(1, TYPE_LOGIN, password));
    });
    sock.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      const packets = readPackets(buf);
      if (!packets.length) return;
      buf = packets[packets.length - 1]!.rest;
      for (const pkt of packets) {
        if (!authed) {
          if (pkt.id === -1) {
            finish(new Error("RCON auth failed."));
            return;
          }
          if (pkt.id === 1) {
            authed = true;
            sock.write(packet(2, TYPE_COMMAND, command));
          }
          continue;
        }
        if (pkt.id === 2 && (pkt.type === TYPE_RESPONSE || pkt.type === TYPE_COMMAND)) {
          finish(undefined, pkt.body);
        }
      }
    });
    sock.on("timeout", () => finish(new Error("RCON timeout.")));
    sock.on("error", (err) => finish(err));
    sock.on("close", () => {
      if (!settled) finish(new Error("RCON closed."));
    });
  });
}

export function shopGrantCommand(ign: string, coins: number, grantId: number): string {
  return `season admin balance ${ign} add ${coins} nlo-shop-${grantId}`;
}

export function rconLooksDelivered(response: string): boolean {
  const text = response.toLowerCase();
  return text.includes("adjusted") || text.includes("added") || text.includes("balance");
}

export function rconLooksUnknownPlayer(response: string): boolean {
  const text = response.toLowerCase();
  return text.includes("has not joined") || text.includes("unknown") || text.includes("not found");
}
