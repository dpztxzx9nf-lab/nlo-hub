import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { AppErrorComponent } from "@/lib/error-component";

export const Route = createFileRoute("/_site")({
  component: SiteShell,
  errorComponent: AppErrorComponent,
});
