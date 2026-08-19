import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { AppErrorComponent } from "@/lib/error-component";
import { getLiveStatus } from "@/lib/nlo/server";

export const Route = createFileRoute("/_site")({
  loader: async () => ({ status: await getLiveStatus() }),
  component: SiteLayout,
  errorComponent: AppErrorComponent,
});

function SiteLayout() {
  const { status } = Route.useLoaderData();
  return <SiteShell status={status} />;
}
