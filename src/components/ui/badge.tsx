import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-xs font-medium uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-foreground/10 text-foreground",
        live: "bg-live text-live-foreground",
        wanted: "bg-wanted text-wanted-foreground",
        gold: "bg-gold text-gold-foreground",
        oak: "bg-oak text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
