import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-sm border border-line bg-background/70 px-3 text-base text-foreground outline-none mc-inset placeholder:text-faint focus-visible:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
