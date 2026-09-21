"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/use-session";

export function HomeRedirect() {
  const router = useRouter();
  const { persona, ready } = useSession();

  useEffect(() => {
    if (!ready) return;
    router.replace(persona ? persona.home : "/login");
  }, [ready, persona, router]);

  return (
    <div className="text-muted-foreground flex min-h-dvh items-center justify-center text-sm">
      Opening GridPulse…
    </div>
  );
}
