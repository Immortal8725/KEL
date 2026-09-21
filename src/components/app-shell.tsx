"use client";

import { usePathname } from "next/navigation";
import { Activity, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/lib/use-platform";
import { formatZar } from "@/lib/format";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/use-session";
import { navForRole } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { go, goReplace } from "@/lib/hard-nav";
import { PRODUCT_BYLINE, PRODUCT_NAME } from "@/lib/brand";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { connected, roi } = usePlatform();
  const { persona, ready, logout } = useSession();
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleString("en-ZA", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!persona) goReplace("/login");
  }, [ready, persona]);

  useEffect(() => {
    if (!ready || !persona) return;
    const allowed = navForRole(persona.role).map((item) => item.href);
    const ok = allowed.some(
      (href) => pathname === href || pathname.startsWith(`${href}/`),
    );
    if (!ok) goReplace(persona.home);
  }, [ready, persona, pathname]);

  if (!ready || !persona) {
    return (
      <div className="text-muted-foreground flex min-h-dvh items-center justify-center text-sm">
        Opening your ElectroRaid workspace…
      </div>
    );
  }

  const nav = navForRole(persona.role);
  const showRoi = persona.role === "dispatcher" || persona.role === "executive";

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/80 bg-sidebar md:flex">
        <div className="border-b border-border/80 px-4 py-4">
          <div className="text-[10px] tracking-[0.22em] text-primary uppercase">
            City of Tshwane
          </div>
          <div className="font-heading mt-1 text-lg font-semibold tracking-tight">
            {PRODUCT_NAME}
          </div>
          <div className="text-primary mt-0.5 text-[10px] tracking-[0.18em] uppercase">
            {PRODUCT_BYLINE}
          </div>
          <div className="text-muted-foreground mt-2 text-xs leading-relaxed">
            {persona.title}
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.href);
                }}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="border-t border-border/80 p-3 text-xs">
          <div className="font-medium">{persona.name}</div>
          <div className="text-muted-foreground">{persona.email}</div>
          {showRoi ? (
            <>
              <div className="text-muted-foreground mt-3">Recovered this shift</div>
              <div className="tabular text-gold mt-1 text-base font-semibold">
                {roi ? formatZar(roi.recoveredZar) : "—"}
              </div>
            </>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => {
              logout();
              go("/login");
            }}
          >
            <LogOut className="size-3.5" />
            Switch user
          </Button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border/80 px-3 py-2 md:px-5">
          <div className="flex items-center gap-2 md:hidden">
            <Activity className="text-primary size-4" />
            <span className="font-heading text-sm font-semibold">{PRODUCT_NAME}</span>
          </div>
          <div className="text-muted-foreground hidden min-w-0 truncate text-xs md:block">
            Signed in as {persona.name} · {persona.title}
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground md:hidden"
              onClick={() => {
                logout();
                go("/login");
              }}
            >
              Switch
            </button>
            <span className="tabular text-muted-foreground">{clock}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
                connected
                  ? "border-primary/40 text-primary"
                  : "border-destructive/40 text-destructive",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  connected ? "bg-primary" : "bg-destructive",
                )}
              />
              {connected ? "Live" : "Reconnecting"}
            </span>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto">{children}</main>
      </div>

      {nav.length > 1 ? (
        <nav
          className="bg-sidebar/95 sticky bottom-0 z-20 border-t border-border/80 md:hidden"
          style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}
        >
          <div className="grid" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(item.href);
                  }}
                  className={cn(
                    "py-2 text-center text-[10px]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
