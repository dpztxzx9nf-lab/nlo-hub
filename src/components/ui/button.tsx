import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-display text-base font-medium transition-transform duration-150 ease-out select-none mc-bevel focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 active:translate-y-px min-h-11 px-4",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:brightness-110",
        oak: "tex-oak text-foreground hover:brightness-110",
        stone: "tex-stone text-foreground hover:brightness-110",
        ghost:
          "bg-transparent text-foreground shadow-none hover:bg-foreground/8",
        gold: "bg-gold text-gold-foreground hover:brightness-110",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { Button, buttonVariants };
