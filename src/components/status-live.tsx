import { Badge } from "@/components/ui/badge";
import type { LiveStatus } from "@/lib/nlo/server";

export function StatusLive({ status }: { status: LiveStatus }) {
  if (!status.checked) {
    return (
      <Badge variant="oak">
        Status unknown · Java {status.version ?? "26.2"}
      </Badge>
    );
  }
  if (!status.online) {
    return <Badge variant="wanted">Offline</Badge>;
  }
  return (
    <Badge variant="live">
      {status.players}/{status.max} online
    </Badge>
  );
}
