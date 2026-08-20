import { useState } from "react";
import { toast } from "sonner";
import { PlayerFace } from "@/components/player-face";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveClaim, type ClaimableName } from "@/lib/nlo/server";

export function ClaimIgnForm({
  initial = "",
  names = [],
  onClaimed,
}: {
  initial?: string;
  names?: ClaimableName[];
  onClaimed: (ign: string) => void;
}) {
  const [ign, setIgn] = useState(initial);
  const [busy, setBusy] = useState(false);
  const online = names.filter((row) => row.online);
  const recent = names.filter((row) => !row.online).slice(0, 8);

  async function submit(name: string) {
    const next = name.trim();
    if (!next) {
      toast.error("Enter the Minecraft name you join with.");
      return;
    }
    setBusy(true);
    try {
      const claimed = await saveClaim({ data: next });
      setIgn(claimed);
      onClaimed(claimed);
      toast.success(`Verified ${claimed}. Shop coins will land on that in-game account.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not verify that name");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(ign);
        }}
      >
        <Input
          value={ign}
          onChange={(e) => setIgn(e.target.value)}
          placeholder="The name you join nlo.gg with"
          required
          autoComplete="off"
          spellCheck={false}
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Verifying…" : "Verify IGN"}
        </Button>
      </form>
      {online.length > 0 ? (
        <div className="mt-4">
          <p className="font-mono text-xs tracking-widest text-muted uppercase">Online now</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {online.map((row) => (
              <button
                key={row.ign}
                type="button"
                disabled={busy}
                onClick={() => {
                  setIgn(row.ign);
                  void submit(row.ign);
                }}
                className="flex items-center gap-2 rounded-sm bg-background/40 px-2 py-1.5 text-sm hover:bg-background/70"
              >
                <PlayerFace ign={row.ign} size={22} />
                {row.ign}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {recent.length > 0 && online.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Join nlo.gg first. We bind coins to the exact name the live server reports.
        </p>
      ) : null}
    </div>
  );
}
