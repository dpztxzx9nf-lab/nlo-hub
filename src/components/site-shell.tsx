import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Toaster } from "sonner";
import { CopyIp } from "@/components/copy-ip";
import { Button } from "@/components/ui/button";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { NAV, SERVER } from "@/lib/nlo/content";
import { cn } from "@/lib/utils";

export function SiteShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster
        theme="dark"
        position="bottom-center"
        toastOptions={{
          className: "tex-oak text-foreground border-line font-sans",
        }}
      />
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40">
      <div className="tex-grass h-1.5" />
      <div className="tex-oak border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 pr-2" onClick={() => setOpen(false)}>
            <span className="grid size-9 place-items-center rounded-sm tex-grass mc-bevel">
              <span className="font-display text-lg leading-none text-accent-foreground">N</span>
            </span>
            <span className="font-display text-2xl leading-none tracking-wide">{SERVER.name}</span>
          </Link>

          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active =
                  "exact" in item && item.exact
                    ? pathname === item.to
                    : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-sm px-3 py-2 text-sm font-medium transition-colors duration-150",
                    active ? "bg-background/40 text-foreground" : "text-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <CopyIp variant="oak" size="sm" />
            <AuthSlot />
          </div>

          <button
            type="button"
            className="ml-auto grid size-11 place-items-center rounded-sm tex-stone mc-bevel lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-line px-4 py-4 lg:hidden">
            <nav className="grid gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="min-h-11 rounded-sm px-3 py-3 text-base text-foreground hover:bg-background/30"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <CopyIp variant="default" />
              <AuthSlot />
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="h-11 w-24 animate-pulse rounded-sm bg-foreground/10" />;
  }
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/account">Desk</Link>
        </Button>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    );
  }
  return (
    <SignedOut>
      <Button variant="stone" size="sm" asChild>
        <Link to="/login">Sign in</Link>
      </Button>
    </SignedOut>
  );
}

function Footer() {
  return (
    <footer className="tex-stone mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-2xl">{SERVER.name}</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            {SERVER.fullName}. Live roster from the Paper ping — not a mock list.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <Link to="/play" className="hover:text-foreground">
            Join
          </Link>
          <Link to="/rules" className="hover:text-foreground">
            Rules
          </Link>
          <a href={SERVER.discord} className="hover:text-foreground" target="_blank" rel="noreferrer">
            Discord
          </a>
          <span className="font-mono text-foreground">{SERVER.ip}</span>
        </div>
      </div>
    </footer>
  );
}
