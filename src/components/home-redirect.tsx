"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/use-session";
import { goReplace } from "@/lib/hard-nav";

export function HomeRedirect() {
  const { persona, ready } = useSession();

  useEffect(() => {
    if (!ready) return;
    goReplace(persona ? persona.home : "/login");
  }, [ready, persona]);

  return (
    <div className="text-muted-foreground flex min-h-dvh items-center justify-center text-sm">
      Opening GridPulse…
    </div>
  );
}
