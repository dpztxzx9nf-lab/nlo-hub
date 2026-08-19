import { createFileRoute } from "@tanstack/react-router";
import { handleClaimGrant, parseGrantId } from "@/lib/nlo/internal";

export const Route = createFileRoute("/api/internal/coin-grants/$id/claim")({
  server: {
    handlers: {
      POST: async ({ request, params }) => handleClaimGrant(request, parseGrantId(params.id)),
    },
  },
});
