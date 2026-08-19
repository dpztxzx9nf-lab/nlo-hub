import {
  claimGrantForDelivery,
  listDeliverableGrants,
  markGrantDelivered,
  releaseGrant,
} from "@/lib/nlo/grants";
import {
  rconCommand,
  rconConfigured,
  rconLooksDelivered,
  rconLooksUnknownPlayer,
  shopGrantCommand,
} from "@/lib/nlo/rcon";

const globalRef = globalThis as typeof globalThis & {
  __nloGrantRconLoop__?: boolean;
};

export function startGrantRconLoop() {
  if (globalRef.__nloGrantRconLoop__) return;
  if (!rconConfigured()) return;
  globalRef.__nloGrantRconLoop__ = true;
  const tick = () => {
    void deliverPendingViaRcon().finally(() => {
      setTimeout(tick, 20_000);
    });
  };
  tick();
}

export async function deliverPendingViaRcon(): Promise<number> {
  if (!rconConfigured()) return 0;
  const pending = await listDeliverableGrants();
  let delivered = 0;
  for (const row of pending) {
    if (!row.ign) continue;
    const claimed = await claimGrantForDelivery(row.id);
    if (!claimed?.ign) continue;
    try {
      const response = await rconCommand(shopGrantCommand(claimed.ign, claimed.coins, claimed.id));
      if (rconLooksUnknownPlayer(response)) {
        await releaseGrant(claimed.id);
        continue;
      }
      if (rconLooksDelivered(response)) {
        await markGrantDelivered(claimed.id, claimed.ign);
        delivered += 1;
        continue;
      }
      await releaseGrant(claimed.id);
    } catch {
      await releaseGrant(claimed.id);
    }
  }
  return delivered;
}
