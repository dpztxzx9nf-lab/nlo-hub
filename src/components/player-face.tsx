import { cn } from "@/lib/utils";

export function PlayerFace({
  ign,
  uuid,
  size = 40,
  className,
}: {
  ign: string;
  uuid?: string | null;
  size?: number;
  className?: string;
}) {
  const key = uuid || ign;
  return (
    <img
      src={`https://mc-heads.net/avatar/${encodeURIComponent(key)}/${size}`}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-xs bg-oak", className)}
      style={{ imageRendering: "pixelated" }}
      crossOrigin="anonymous"
    />
  );
}
