import { createFileRoute } from "@tanstack/react-router";
import { grokOAuthMode } from "@/lib/auth/server";
import { internalSecret } from "@/lib/nlo/grants";
import { stripeConfigured, stripeLive, webhookConfigured } from "@/lib/nlo/stripe";

export const Route = createFileRoute("/api/shop/status")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(
          {
            card: stripeConfigured(),
            live: stripeLive(),
            webhook: webhookConfigured(),
            oauth: grokOAuthMode,
            grants: Boolean(internalSecret()),
          },
          { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
        );
      },
    },
  },
});
