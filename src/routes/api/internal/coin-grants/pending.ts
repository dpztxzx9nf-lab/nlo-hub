import { createFileRoute } from "@tanstack/react-router";
import { handlePendingGrants } from "@/lib/nlo/internal";
import { startGrantRconLoop } from "@/lib/nlo/rcon-deliver.server";

startGrantRconLoop();

export const Route = createFileRoute("/api/internal/coin-grants/pending")({
  server: {
    handlers: {
      GET: async ({ request }) => handlePendingGrants(request),
    },
  },
});
