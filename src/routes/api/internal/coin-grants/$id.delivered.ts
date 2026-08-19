import { createFileRoute } from "@tanstack/react-router";
import { handleMarkDelivered, parseGrantId } from "@/lib/nlo/internal";

export const Route = createFileRoute("/api/internal/coin-grants/$id/delivered")({
  server: {
    handlers: {
      POST: async ({ request, params }) => handleMarkDelivered(request, parseGrantId(params.id)),
    },
  },
});
