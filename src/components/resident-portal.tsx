"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { evidenceSvg } from "@/lib/evidence";
import { classificationLabel, relativeMinutes } from "@/lib/format";
import { postJson, usePlatform } from "@/lib/use-platform";
import { useSession } from "@/lib/use-session";
import { etaMinutes, distanceMetres } from "@/lib/geo";
import type { IngestReportInput } from "@/lib/types";

export function ResidentPortal() {
  const { persona } = useSession();
  const { snapshot, liveEvent } = usePlatform();
  const [mode, setMode] = useState<"outage" | "tip">("outage");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const suburb = persona?.suburb ?? "Mamelodi";
  const account = persona?.accountNumber ?? "3218840441";

  const localIncidents = useMemo(
    () =>
      (snapshot?.incidents ?? []).filter(
        (i) =>
          i.suburb === suburb && i.status !== "resolved" && i.status !== "closed",
      ),
    [snapshot, suburb],
  );

  const updates = useMemo(() => {
    const events = snapshot?.events ?? [];
    return events.filter(
      (e) =>
        e.detail.toLowerCase().includes(suburb.toLowerCase()) ||
        e.title.toLowerCase().includes("dispatch") ||
        e.title.toLowerCase().includes("restor") ||
        e.type.startsWith("incident") ||
        e.type.startsWith("dispatch"),
    ).slice(0, 8);
  }, [snapshot, suburb]);

  async function submit() {
    if (!persona) return;
    setBusy(true);
    const body: IngestReportInput = {
      accountNumber: mode === "outage" ? account : null,
      reporterName: mode === "tip" ? "Anonymous tip" : persona.name,
      contactPhone: mode === "tip" ? null : "+27 82 441 0190",
      location: { lon: 28.394 + Math.random() * 0.002, lat: -25.7234 + Math.random() * 0.002 },
      address:
        mode === "tip"
          ? "Informal tap, Tsamaya Road, Mamelodi Ext 11"
          : "12 Tsamaya Road, Mamelodi Ext 11",
      suburb,
      classification: mode === "tip" ? "izinyoka_tip" : "no_power",
      channel: mode === "tip" ? "anonymous_tip" : "whatsapp",
      notes: notes || null,
      feederId: "fdr_mam_12",
    };
    const result = await postJson<{
      ok: boolean;
      kind?: string;
      merged?: boolean;
      matchDistanceM?: number | null;
      incident?: { reference: string; affectedHouseholds: number; id: string };
      investigation?: { reference: string; id: string };
    }>("/api/reports", body);

    if (result.kind === "tip" && result.investigation?.id) {
      await postJson("/api/field/action", {
        action: "evidence",
        kind: "investigation",
        targetId: result.investigation.id,
        caption: "Resident photo — suspected illegal connection",
        dataUri: evidenceSvg(
          "WhatsApp tip photo",
          "Anonymous Izinyoka evidence from Mamelodi Ext 11.",
        ),
        actorId: persona.id,
      });
    }
    setBusy(false);
    if (!result.ok) {
      setMessage("Could not reach the control room.");
      return;
    }
    if (result.kind === "tip") {
      setMessage(
        `Tip ${result.investigation?.reference} is with Revenue Protection. You stay anonymous.`,
      );
      return;
    }
    setMessage(
      result.merged
        ? `Your report joined ${result.incident?.reference} (${result.matchDistanceM} m). ${result.incident?.affectedHouseholds} households on this ticket. We will WhatsApp the ETA.`
        : `Opened ${result.incident?.reference}. Dispatch is clustering nearby reports.`,
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="text-[10px] tracking-[0.2em] text-primary uppercase">
        Resident · WhatsApp / PWA
      </div>
      <h1 className="font-heading text-2xl font-semibold">My electricity</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Account {account} · {suburb}. Report a fault or send an anonymous
        Izinyoka tip. Status and ETA land here the same way they would on
        WhatsApp.
      </p>

      <div className="mt-5 space-y-3">
        {localIncidents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-4 text-sm">
            No open outage on your feeder right now.
          </div>
        ) : (
          localIncidents.map((incident) => {
            const crew = snapshot?.crews.find((c) => c.id === incident.assignedCrewId);
            const eta = crew
              ? etaMinutes(distanceMetres(crew.location, incident.location))
              : null;
            return (
              <div key={incident.id} className="rounded-xl border border-border bg-card p-4">
                <div className="font-mono text-xs">{incident.reference}</div>
                <div className="mt-1 font-medium">{incident.address}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {incident.affectedHouseholds} households ·{" "}
                  {classificationLabel(incident.classification)} ·{" "}
                  {incident.status.replaceAll("_", " ")}
                </div>
                {crew ? (
                  <div className="text-primary mt-2 text-sm font-medium">
                    {crew.callsign} {incident.status === "on_site" ? "on site" : "en route"}
                    {eta && incident.status !== "on_site" ? ` · ETA ${eta} min` : ""}
                  </div>
                ) : (
                  <div className="text-muted-foreground mt-2 text-xs">
                    Waiting for dispatch · reported {relativeMinutes(incident.firstReportedAt)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-[#0c1f18] p-4">
        <div className="text-[10px] tracking-wide text-[#9ad7b8] uppercase">
          GridPulse WhatsApp
        </div>
        <div className="mt-3 space-y-2">
          {(liveEvent ? [liveEvent, ...updates] : updates).slice(0, 5).map((evt) => (
            <div
              key={evt.id}
              className="max-w-[92%] rounded-2xl rounded-bl-sm bg-[#1f3d32] px-3 py-2 text-xs"
            >
              <div className="font-medium text-[#d7efe6]">{evt.title}</div>
              <div className="mt-0.5 text-[#9ad7b8]">{evt.detail}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button
          variant={mode === "outage" ? "default" : "outline"}
          onClick={() => setMode("outage")}
        >
          No power
        </Button>
        <Button
          variant={mode === "tip" ? "default" : "outline"}
          onClick={() => setMode("tip")}
        >
          Anonymous tip
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            mode === "tip"
              ? "Where is the illegal tap? We will hide your number."
              : "Whole street dark, mini-sub noise, cable down…"
          }
        />
        <Button className="w-full" disabled={busy} onClick={submit}>
          {busy
            ? "Sending…"
            : mode === "tip"
              ? "Send anonymous Izinyoka tip + photo"
              : "Submit outage report"}
        </Button>
        {message ? <p className="text-primary text-sm">{message}</p> : null}
      </div>
    </div>
  );
}
