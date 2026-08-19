export const GRANT_STATUSES = ["pending", "delivering", "delivered", "failed"] as const;
export type GrantStatus = (typeof GRANT_STATUSES)[number];

export type GrantRow = {
  id: number;
  user_id: string;
  ign: string | null;
  coins: number;
  stripe_session_id: string;
  status: GrantStatus;
  created_at: string;
  delivered_at: string | null;
  attempted_at: string | null;
};

export type GrantDesk = {
  claimedIgn: string | null;
  pendingCoins: number;
  pendingCount: number;
  deliveredCoins: number;
  grants: GrantRow[];
};

export const IGN_RE = /^[\w.]{1,32}$/;

export function isValidIgn(raw: string): boolean {
  return IGN_RE.test(raw.trim());
}

/** Compare claimed IGN to an in-game name, including Floodgate's leading ".". */
export function ignKey(raw: string): string {
  return raw.trim().replace(/^\.+/, "").toLowerCase();
}

export function ignsMatch(claimed: string | null | undefined, online: string | null | undefined): boolean {
  if (!claimed || !online) return false;
  return ignKey(claimed) === ignKey(online);
}

export function publicGrantStatus(status: string): "pending" | "delivered" | "failed" {
  if (status === "delivered") return "delivered";
  if (status === "failed") return "failed";
  return "pending";
}

export function deliveryToast(grant: Pick<GrantRow, "coins" | "ign">): string {
  if (grant.ign) {
    return `${grant.coins.toLocaleString()} coins queued for ${grant.ign}. Join nlo.gg to receive them.`;
  }
  return "Claim your Minecraft IGN so coins can be delivered in-game.";
}
