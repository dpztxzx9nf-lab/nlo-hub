import { createFileRoute } from "@tanstack/react-router";
import { getWorldSnapshot } from "@/lib/nlo/live";

export const Route = createFileRoute("/api/live")({
  server: {
    handlers: {
      GET: async () => {
        const snap = await getWorldSnapshot();
        return Response.json(
          {
            status: snap.status,
            online: snap.onlineNames.map((ign) => {
              const row = snap.roster.find((p) => p.ign.toLowerCase() === ign.toLowerCase());
              return { ign, uuid: row?.uuid ?? null };
            }),
            at: Date.now(),
          },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          },
        );
      },
    },
  },
});
