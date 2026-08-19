import { createFileRoute } from "@tanstack/react-router";
import { handleReleaseGrant, parseGrantId } from "@/lib/nlo/internal";

export const Route = createFileRoute("/api/internal/coin-grants/$id/release")({
  server: {
    handlers: {
      POST: async ({ request, params }) => handleReleaseGrant(request, parseGrantId(params.id)),
    },
  },
});
