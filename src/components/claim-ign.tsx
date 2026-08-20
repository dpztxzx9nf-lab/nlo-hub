import { useState } from "react";
import { toast } from "sonner";
import { PlayerFace } from "@/components/player-face";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { previewClaim, saveClaim, type ClaimableName, type ClaimPreview } from "@/lib/nlo/server";

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
  const [preview, setPreview] = useState<ClaimPreview | null>(null);
  const online = names.filter((row) => row.online);
  const recent = names.filter((row) => !row.online).slice(0, 8);

  async function lookup(name: string) {
    const next = name.trim();
    if (!next) {
      toast.error("Enter the Minecraft name you join with.");
      return;
    }
    setBusy(true);
    setPreview(null);
    try {
      const nextPreview = await previewClaim({ data: next });
      setIgn(nextPreview.ign);
      setPreview(nextPreview);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not match that name");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!preview) return;
    setBusy(true);
    try {
      const claimed = await saveClaim({ data: preview.ign });
      setIgn(claimed);
      setPreview(null);
      onClaimed(claimed);
      toast.success(`Bound to ${claimed}. Shop coins will land on that in-game account.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not bind that name");
    } finally {
      setBusy(false);
    }
  }

  function nameButtons(rows: ClaimableName[]) {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {rows.map((row) => (
          <button
            key={row.ign}
            type="button"
            disabled={busy}
            onClick={() => {
              setIgn(row.ign);
              void lookup(row.ign);
            }}
            className="flex items-center gap-2 rounded-sm bg-background/40 px-2 py-1.5 text-sm hover:bg-background/70"
          >
            <PlayerFace ign={row.ign} uuid={row.uuid} size={22} />
            {row.ign}
          </button>
        ))}
      </div>
    );
  }

  if (preview) {
    return (
      <div className="mt-4 rounded-sm bg-background/40 px-3 py-3">
        <div className="flex items-start gap-3">
          <PlayerFace ign={preview.ign} uuid={preview.uuid} size={48} />
          <div>
            <p className="font-mono text-xs tracking-widest text-muted uppercase">Confirm this is you</p>
            <p className="mt-1 font-display text-2xl">{preview.ign}</p>
            <p className="mt-1 text-sm text-muted">
              {preview.online
                ? "Online on nlo.gg right now. Coins will land on this account."
                : "Seen on nlo.gg. Join with this exact name for coins to deposit."}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" disabled={busy} onClick={() => void confirm()}>
            {busy ? "Binding…" : "Yes, this is me"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setPreview(null);
              setIgn("");
            }}
          >
            Not me
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(ign);
        }}
      >
        <Input
          value={ign}
          onChange={(e) => setIgn(e.target.value)}
          placeholder="Minecraft username (not your real name)"
          required
          type="text"
          name="nlo-minecraft-ign"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          data-1p-ignore="true"
          data-lpignore="true"
          data-form-type="other"
        />
        <Button type="submit" disabled={busy}>
          {busy ? "Checking…" : "Check name"}
        </Button>
      </form>
      {online.length > 0 ? (
        <div className="mt-4">
          <p className="font-mono text-xs tracking-widest text-muted uppercase">Online now</p>
          {nameButtons(online)}
        </div>
      ) : null}
      {recent.length > 0 ? (
        <div className="mt-4">
          <p className="font-mono text-xs tracking-widest text-muted uppercase">Recently on nlo.gg</p>
          {nameButtons(recent)}
        </div>
      ) : null}
      {online.length === 0 && recent.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Join nlo.gg first. We only bind coins to a name the live server has already seen.
        </p>
      ) : null}
    </div>
  );
}
