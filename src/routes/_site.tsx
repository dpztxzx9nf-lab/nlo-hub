import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site-shell";
import { AppErrorComponent } from "@/lib/error-component";
import { getLiveStatus } from "@/lib/nlo/server";

const getSiteSession = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionUser } = await import("@/lib/auth/verify.server");
  const user = await getSessionUser();
  return user ? { id: user.id, email: user.email } : null;
});

export const Route = createFileRoute("/_site")({
  loader: async () => {
    const [status, session] = await Promise.all([getLiveStatus(), getSiteSession()]);
    return { status, session };
  },
  component: SiteLayout,
  errorComponent: AppErrorComponent,
});

function SiteLayout() {
  const { status, session } = Route.useLoaderData();
  return <SiteShell status={status} session={session} />;
}
