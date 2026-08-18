import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageFrame({
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-6xl px-4 pt-10 pb-16", className)}>
      <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">{title}</h1>
      {lead ? <p className="mt-3 max-w-2xl text-muted">{lead}</p> : null}
      <div className="mt-8">{children}</div>
    </div>
  );
}

export function Panel({
  children,
  className,
  texture = "stone",
}: {
  children: ReactNode;
  className?: string;
  texture?: "stone" | "oak";
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-1 mc-bevel",
        texture === "oak" ? "tex-oak" : "tex-stone",
        className,
      )}
    >
      <div className="rounded-md bg-background/55 p-5">{children}</div>
    </div>
  );
}
