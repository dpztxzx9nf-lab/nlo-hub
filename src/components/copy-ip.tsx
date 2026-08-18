import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SERVER } from "@/lib/nlo/content";

type Variant = "default" | "oak" | "stone" | "ghost" | "gold";
type Size = "default" | "sm" | "lg";

function CopyValue({
  value,
  label,
  variant = "default",
  size = "default",
}: {
  value: string;
  label: string;
  variant?: Variant;
  size?: Size;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`Copied ${label}`);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(`Could not copy — select ${label} yourself`);
    }
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={() => void copy()}>
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {label}
    </Button>
  );
}

export function CopyIp({
  variant = "default",
  size = "default",
}: {
  variant?: Variant;
  size?: Size;
}) {
  return <CopyValue value={SERVER.ip} label={SERVER.ip} variant={variant} size={size} />;
}

export function CopyConsoleFriend({
  variant = "gold",
  size = "default",
}: {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <CopyValue
      value={SERVER.consoleFriend}
      label={SERVER.consoleFriend}
      variant={variant}
      size={size}
    />
  );
}
