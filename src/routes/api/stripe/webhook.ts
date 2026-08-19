import { createFileRoute } from "@tanstack/react-router";
import { fulfillStripeWebhook, webhookSecret } from "@/lib/nlo/stripe";
import { startGrantRconLoop } from "@/lib/nlo/rcon-deliver.server";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!webhookSecret()) {
          return Response.json({ error: "Stripe webhook is not configured." }, { status: 503 });
        }
        const signature = request.headers.get("stripe-signature") ?? "";
        const payload = await request.text();
        try {
          const result = await fulfillStripeWebhook(payload, signature);
          startGrantRconLoop();
          return Response.json({ ok: true, ...("already" in result ? { already: result.already } : {}) });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Webhook failed.";
          const status = message.includes("signature") ? 400 : 400;
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
