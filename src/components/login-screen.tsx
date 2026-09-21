"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PERSONAS, DEMO_PASSWORD, useSession } from "@/lib/use-session";
import { goReplace } from "@/lib/hard-nav";
import { PRODUCT_FULL, PRODUCT_NAME, PRODUCT_BYLINE } from "@/lib/brand";

export function LoginScreen() {
  const { login, loginWithPassword } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);

  function enter(id: string) {
    const persona = login(id);
    if (persona) goReplace(persona.home);
  }

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    const persona = loginWithPassword(email, password);
    if (!persona) {
      setError("Unknown demo account. Password for every persona is gridpulse.");
      return;
    }
    goReplace(persona.home);
  }

  return (
    <div className="min-h-dvh px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-[10px] tracking-[0.24em] text-primary uppercase">
          City of Tshwane · {PRODUCT_NAME} {PRODUCT_BYLINE}
        </div>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Sign in to {PRODUCT_NAME}
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
          {PRODUCT_FULL} — fake municipal login. Pick a persona. Each role
          opens a different product: resident channel, control-room ops,
          technician PWA, or revenue-protection audit kit. Password for typed
          login is <code className="text-foreground">gridpulse</code>.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => enter(p.id)}
              className="rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/50 hover:bg-muted/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-primary text-[10px] tracking-wide uppercase">
                    {p.role.replaceAll("_", " ")}
                  </div>
                  <div className="font-heading mt-1 text-lg font-semibold">
                    {p.name}
                  </div>
                  <div className="text-muted-foreground text-xs">{p.title}</div>
                </div>
                <span className="bg-primary/15 text-primary rounded-full px-2 py-0.5 text-[10px]">
                  Enter
                </span>
              </div>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {p.blurb}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.duties.map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px]"
                  >
                    {d}
                  </span>
                ))}
              </div>
              <div className="text-muted-foreground mt-4 font-mono text-[11px]">
                {p.email}
              </div>
            </button>
          ))}
        </div>

        <form
          onSubmit={submitPassword}
          className="mt-8 max-w-md rounded-xl border border-border p-4"
        >
          <div className="text-xs font-medium">Or type a demo account</div>
          <div className="mt-3 space-y-2">
            <Input
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Sign in
            </Button>
            {error ? <p className="text-destructive text-xs">{error}</p> : null}
          </div>
        </form>
      </div>
    </div>
  );
}
