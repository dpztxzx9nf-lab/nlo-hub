import {
  authorizeInternal,
  claimGrantForDelivery,
  listDeliverableGrants,
  markGrantDelivered,
  releaseGrant,
  unauthorizedInternal,
} from "@/lib/nlo/grants";

function jsonGrant(grant: Awaited<ReturnType<typeof markGrantDelivered>>) {
  if (!grant) return null;
  return {
    id: grant.id,
    user_id: grant.user_id,
    ign: grant.ign,
    coins: grant.coins,
    stripe_session_id: grant.stripe_session_id,
    status: grant.status,
    created_at: grant.created_at,
    delivered_at: grant.delivered_at,
  };
}

export async function handlePendingGrants(request: Request): Promise<Response> {
  if (!authorizeInternal(request)) return unauthorizedInternal();
  const grants = await listDeliverableGrants();
  return Response.json(
    {
      grants: grants.map((g) => ({
        id: g.id,
        user_id: g.user_id,
        ign: g.ign,
        coins: g.coins,
        stripe_session_id: g.stripe_session_id,
        status: g.status,
        created_at: g.created_at,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function handleClaimGrant(request: Request, id: number): Promise<Response> {
  if (!authorizeInternal(request)) return unauthorizedInternal();
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Unknown grant." }, { status: 404 });
  const grant = await claimGrantForDelivery(id);
  if (!grant) return Response.json({ error: "Grant is not deliverable." }, { status: 409 });
  return Response.json({ ok: true, grant: jsonGrant(grant) });
}

export async function handleMarkDelivered(request: Request, id: number): Promise<Response> {
  if (!authorizeInternal(request)) return unauthorizedInternal();
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Unknown grant." }, { status: 404 });
  let ign: string | undefined;
  try {
    const body = (await request.json()) as { ign?: unknown };
    if (typeof body.ign === "string" && body.ign.trim()) ign = body.ign.trim();
  } catch {
    ign = undefined;
  }
  const grant = await markGrantDelivered(id, ign);
  if (!grant) return Response.json({ error: "Unknown grant." }, { status: 404 });
  return Response.json({
    ok: true,
    already: grant.status === "delivered" && Boolean(grant.delivered_at),
    grant: jsonGrant(grant),
  });
}

export async function handleReleaseGrant(request: Request, id: number): Promise<Response> {
  if (!authorizeInternal(request)) return unauthorizedInternal();
  if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Unknown grant." }, { status: 404 });
  const grant = await releaseGrant(id);
  if (!grant) return Response.json({ ok: true, already: true });
  return Response.json({ ok: true, grant: jsonGrant(grant) });
}

export function parseGrantId(raw: string | undefined): number {
  const id = Number(raw);
  return Number.isInteger(id) ? id : Number.NaN;
}
