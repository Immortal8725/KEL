"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { evidenceSvg } from "@/lib/evidence";
import { classificationLabel, relativeMinutes } from "@/lib/format";
import { postJson, usePlatform } from "@/lib/use-platform";
import { useSession } from "@/lib/use-session";
import { etaMinutes, distanceMetres } from "@/lib/geo";
import { OUTAGE_REPORT_OPTIONS, TIP_REPORT_OPTIONS } from "@/lib/report-options";
import type { IngestReportInput, InvestigationType, OutageClassification } from "@/lib/types";

export function ResidentPortal() {
  const { persona } = useSession();
  const { snapshot, liveEvent } = usePlatform();
  const [mode, setMode] = useState<"outage" | "tip">("outage");
  const [outageType, setOutageType] = useState<OutageClassification>("no_power");
  const [tipType, setTipType] = useState<string>("illegal_connection");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const suburb = persona?.suburb ?? "Mamelodi";
  const account = persona?.accountNumber ?? "3218840441";
  const needsOther = mode === "outage" ? outageType === "other" : tipType === "other";

  const localIncidents = useMemo(
    () =>
      (snapshot?.incidents ?? []).filter(
        (i) => i.suburb === suburb && i.status !== "closed",
      ),
    [snapshot, suburb],
  );

  const suburbIncidentIds = useMemo(
    () =>
      new Set(
        (snapshot?.incidents ?? [])
          .filter((i) => i.suburb === suburb)
          .map((i) => i.id),
      ),
    [snapshot, suburb],
  );

  const notifications = useMemo(() => {
    const events = snapshot?.events ?? [];
    return events
      .filter(
        (e) =>
          (e.type === "field.onsite" ||
            e.type === "incident.resolved" ||
            e.type === "dispatch.assigned" ||
            e.type === "incident.resident_confirmed" ||
            e.type === "incident.resident_dispute") &&
          (!e.entityId || suburbIncidentIds.has(e.entityId)),
      )
      .slice(0, 6);
  }, [snapshot, suburbIncidentIds]);

  async function submit() {
    if (!persona) return;
    if (needsOther && !notes.trim()) {
      setMessage("Other needs a short description of what you are seeing.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const chosen =
        mode === "tip"
          ? TIP_REPORT_OPTIONS.find((o) => o.value === tipType)
          : OUTAGE_REPORT_OPTIONS.find((o) => o.value === outageType);
      const detail = needsOther
        ? `Other: ${notes.trim()}`
        : mode === "tip"
          ? `[${chosen?.label}] ${notes}`.trim()
          : notes || null;
      const body: IngestReportInput = {
        accountNumber: mode === "outage" ? account : null,
        reporterName: mode === "tip" ? "Anonymous tip" : persona.name,
        contactPhone: mode === "tip" ? null : "+27 82 441 0190",
        location: {
          lon: 28.394 + Math.random() * 0.002,
          lat: -25.7234 + Math.random() * 0.002,
        },
        address:
          mode === "tip"
            ? "Informal tap, Tsamaya Road, Mamelodi Ext 11"
            : "12 Tsamaya Road, Mamelodi Ext 11",
        suburb,
        classification: mode === "tip" ? "izinyoka_tip" : outageType,
        channel: mode === "tip" ? "anonymous_tip" : "whatsapp",
        notes: detail,
        feederId: "fdr_mam_12",
        investigationType:
          mode === "tip" ? (tipType as InvestigationType | "other") : undefined,
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
          caption: `${chosen?.label ?? "Other"} — resident photo`,
          dataUri: evidenceSvg(
            "WhatsApp tip photo",
            notes || "Anonymous evidence from Mamelodi Ext 11.",
          ),
          actorId: persona.id,
        });
      }
      if (!result.ok) {
        setMessage("Could not reach the control room. Try again.");
        return;
      }
      if (result.kind === "tip") {
        setMessage(
          `Tip ${result.investigation?.reference} is with Revenue Protection. Your number stays hidden.`,
        );
        return;
      }
      setMessage(
        result.merged
          ? `Your report joined ${result.incident?.reference} (${result.matchDistanceM} m). ${result.incident?.affectedHouseholds} households on this ticket. We will notify you when the technician logs on site.`
          : `Opened ${result.incident?.reference}. You will get a message when a technician logs and when they finish.`,
      );
      if (needsOther) setNotes("");
    } catch {
      setMessage("Could not send. Check the connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(id: string) {
    await postJson("/api/field/action", {
      action: "confirm",
      kind: "outage",
      targetId: id,
      actorId: persona?.id,
    });
    setMessage("Thank you. You confirmed power is back. Ticket closed.");
  }

  async function dispute(id: string) {
    await postJson("/api/field/action", {
      action: "dispute",
      kind: "outage",
      targetId: id,
      actorId: persona?.id,
    });
    setMessage("Still no power logged. Dispatch will send a crew again.");
  }

  const notifyTypes = new Set([
    "field.onsite",
    "incident.resolved",
    "dispatch.assigned",
    "incident.resident_confirmed",
    "incident.resident_dispute",
  ]);
  const latest =
    liveEvent &&
    notifyTypes.has(liveEvent.type) &&
    (!liveEvent.entityId || suburbIncidentIds.has(liveEvent.entityId))
      ? liveEvent
      : notifications[0];

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="text-[10px] tracking-[0.2em] text-primary uppercase">
        Resident · WhatsApp / PWA
      </div>
      <h1 className="font-heading text-2xl font-semibold">My electricity</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Account {account} · {suburb}. Pick what you are seeing from the list.
        If it is not there, choose Other and describe it.
      </p>

      {latest ? (
        <div className="border-primary/40 bg-primary/10 mt-4 rounded-xl border px-4 py-3">
          <div className="text-[10px] tracking-wide text-primary uppercase">
            Notification
          </div>
          <div className="mt-1 text-sm font-medium">{latest.title}</div>
          <div className="text-muted-foreground mt-0.5 text-xs">{latest.detail}</div>
        </div>
      ) : null}

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
            const techDone = incident.status === "resolved";
            return (
              <div key={incident.id} className="rounded-xl border border-border bg-card p-4">
                <div className="font-mono text-xs">{incident.reference}</div>
                <div className="mt-1 font-medium">{incident.address}</div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {classificationLabel(incident.classification)} ·{" "}
                  {incident.affectedHouseholds} households ·{" "}
                  {incident.status.replaceAll("_", " ")}
                </div>
                {incident.status === "on_site" ? (
                  <div className="text-primary mt-2 text-sm font-medium">
                    Technician has logged on site
                    {crew ? ` · ${crew.callsign}` : ""}. Stay near the meter if you can.
                  </div>
                ) : crew && !techDone ? (
                  <div className="text-primary mt-2 text-sm font-medium">
                    {crew.callsign} en route
                    {eta ? ` · ETA ${eta} min` : ""}
                  </div>
                ) : !techDone ? (
                  <div className="text-muted-foreground mt-2 text-xs">
                    Waiting for dispatch · reported {relativeMinutes(incident.firstReportedAt)}
                  </div>
                ) : null}

                {techDone ? (
                  <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <div className="text-sm font-medium">
                      Technician says the job is done. Is your power back?
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => confirm(incident.id)}>
                        Confirm restored
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispute(incident.id)}
                      >
                        Still no power
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={mode === "outage" ? "default" : "outline"}
            onClick={() => setMode("outage")}
          >
            Fault / outage
          </Button>
          <Button
            variant={mode === "tip" ? "default" : "outline"}
            onClick={() => setMode("tip")}
          >
            Anonymous tip
          </Button>
        </div>
        <div className="mt-3 space-y-2">
          <div className="text-muted-foreground text-xs">
            {mode === "tip" ? "What do you want to report?" : "What is happening?"}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(mode === "outage" ? OUTAGE_REPORT_OPTIONS : TIP_REPORT_OPTIONS).map(
              (opt) => {
                const selected =
                  mode === "outage" ? outageType === opt.value : tipType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      if (mode === "outage") {
                        setOutageType(opt.value as OutageClassification);
                      } else {
                        setTipType(opt.value);
                      }
                      setMessage(null);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {opt.short}
                  </button>
                );
              },
            )}
          </div>
          <p className="text-muted-foreground text-[11px]">
            {mode === "outage"
              ? OUTAGE_REPORT_OPTIONS.find((o) => o.value === outageType)?.hint
              : TIP_REPORT_OPTIONS.find((o) => o.value === tipType)?.hint}
          </p>
          {needsOther ? (
            <label className="block text-xs">
              <span className="mb-1 block font-medium">
                Other — type what you want to report
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="border-input bg-input/30 w-full rounded-lg border px-2.5 py-2 text-sm"
                placeholder="e.g. Burning smell from the pole, sparks on the roof…"
              />
            </label>
          ) : (
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                mode === "tip"
                  ? "Where is it? Street, landmark, what you saw. Your number stays hidden."
                  : "Optional extra detail for the crew…"
              }
            />
          )}
          <Button className="w-full" disabled={busy} onClick={submit}>
            {busy
              ? "Sending…"
              : mode === "tip"
                ? "Send anonymous tip"
                : "Submit report"}
          </Button>
          {message ? <p className="text-primary text-sm">{message}</p> : null}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-[#0c1f18] p-4">
        <div className="text-[10px] tracking-wide text-[#9ad7b8] uppercase">
          GridPulse messages
        </div>
        <div className="mt-3 space-y-2">
          {notifications.length === 0 ? (
            <p className="text-xs text-[#9ad7b8]">
              You will be notified here when a technician logs on site and when they finish.
            </p>
          ) : (
            notifications.map((evt) => (
              <div
                key={evt.id}
                className="max-w-[92%] rounded-2xl rounded-bl-sm bg-[#1f3d32] px-3 py-2 text-xs"
              >
                <div className="font-medium text-[#d7efe6]">{evt.title}</div>
                <div className="mt-0.5 text-[#9ad7b8]">{evt.detail}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
