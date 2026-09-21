"use client";

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlatformProvider } from "@/lib/use-platform";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* prototype: field PWA still works without the worker */
      });
    }
  }, []);

  return (
    <TooltipProvider>
      <PlatformProvider>{children}</PlatformProvider>
    </TooltipProvider>
  );
}
