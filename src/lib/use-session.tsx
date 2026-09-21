"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  PERSONAS,
  SESSION_KEY,
  personaByEmail,
  personaById,
  type DemoPersona,
  DEMO_PASSWORD,
} from "./session";

interface SessionValue {
  persona: DemoPersona | null;
  ready: boolean;
  login: (id: string) => DemoPersona | null;
  loginWithPassword: (email: string, password: string) => DemoPersona | null;
  logout: () => void;
}

const SessionContext = createContext<SessionValue>({
  persona: null,
  ready: false,
  login: () => null,
  loginWithPassword: () => null,
  logout: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersona] = useState<DemoPersona | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { id?: string };
        const found = parsed.id ? personaById(parsed.id) : undefined;
        if (found) setPersona(found);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      persona,
      ready,
      login: (id: string) => {
        const found = personaById(id) ?? null;
        setPersona(found);
        if (found) localStorage.setItem(SESSION_KEY, JSON.stringify({ id: found.id }));
        return found;
      },
      loginWithPassword: (email: string, password: string) => {
        const found = personaByEmail(email);
        if (!found || password !== DEMO_PASSWORD) return null;
        setPersona(found);
        localStorage.setItem(SESSION_KEY, JSON.stringify({ id: found.id }));
        return found;
      },
      logout: () => {
        setPersona(null);
        localStorage.removeItem(SESSION_KEY);
      },
    }),
    [persona, ready],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export { PERSONAS, DEMO_PASSWORD };
