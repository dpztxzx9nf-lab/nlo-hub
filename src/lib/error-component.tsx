import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export function AppErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-xs tracking-widest text-accent uppercase">Ledger hiccup</p>
      <h1 className="mt-3 font-display text-4xl">Could not load that page</h1>
      <p className="mt-3 text-sm text-muted">
        {error.message || "Try again. The world is still up."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="min-h-11 rounded-sm bg-accent px-5 font-display text-accent-foreground mc-bevel"
        >
          Try again
        </button>
        <Link
          to="/"
          className="min-h-11 rounded-sm tex-oak px-5 py-2.5 font-display mc-bevel"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
