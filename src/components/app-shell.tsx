"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ClipboardList,
  Map,
  Radio,
  ShieldAlert,
  Smartphone,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/lib/use-platform";
import { formatZar } from "@/lib/format";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Command", icon: Map },
  { href: "/demo", label: "Demo", icon: Radio },
  { href: "/field", label: "Field", icon: Smartphone },
  { href: "/audit", label: "Audit", icon: ClipboardList },
  { href: "/analytics", label: "ROI", icon: Wallet },
  { href: "/report", label: "Report", icon: ShieldAlert },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { connected, roi } = usePlatform();
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

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border/80 bg-sidebar md:flex">
        <div className="border-b border-border/80 px-4 py-4">
          <div className="text-[10px] tracking-[0.22em] text-primary uppercase">
            City of Tshwane
          </div>
          <div className="font-heading mt-1 text-lg font-semibold tracking-tight">
            GridPulse
          </div>
          <div className="text-muted-foreground text-xs">
            Outage &amp; revenue protection
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/80 p-3 text-xs">
          <div className="text-muted-foreground">Recovered this shift</div>
          <div className="tabular text-gold mt-1 text-base font-semibold">
            {roi ? formatZar(roi.recoveredZar) : "—"}
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border/80 px-3 py-2 md:px-5">
          <div className="flex items-center gap-2 md:hidden">
            <Activity className="text-primary size-4" />
            <span className="font-heading text-sm font-semibold">GridPulse</span>
          </div>
          <div className="text-muted-foreground hidden text-xs md:block">
            Municipal operations · Energy &amp; electricity
          </div>
          <div className="flex items-center gap-3 text-xs">
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

      <nav className="bg-sidebar/95 sticky bottom-0 z-20 grid grid-cols-6 border-t border-border/80 md:hidden">
        {NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[10px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
