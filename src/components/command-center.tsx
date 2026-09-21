"use client";

import { useMemo, useState } from "react";
import { CommandMap } from "@/components/command-map";
import { DemoRail } from "@/components/demo-rail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { priorityBand } from "@/lib/engines/priority";
import {
  classificationLabel,
  formatZar,
  formatMinutes,
  relativeMinutes,
} from "@/lib/format";
import { usePlatform, postJson } from "@/lib/use-platform";
import type { MasterIncident, RevenueInvestigation } from "@/lib/types";

export function CommandCenter() {
  const { snapshot, roi, liveEvent, error } = usePlatform();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(true);

  const selectedIncident = snapshot?.incidents.find((i) => i.id === selectedId);
  const selectedInv = snapshot?.investigations.find((i) => i.id === selectedId);

  const openIncidents = useMemo(
    () =>
      (snapshot?.incidents ?? []).filter(
        (i) => i.status !== "resolved" && i.status !== "closed",
      ),
    [snapshot],
  );

  if (error && !snapshot) {
    return (
      <div className="text-destructive p-8">
        Command centre could not load: {error}
      </div>
    );
  }

  if (!snapshot || !roi) {
    return (
      <div className="text-muted-foreground p-8 text-sm">
        Connecting to the Tshwane ops floor…
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="relative min-h-[52vh] lg:min-h-0">
        <CommandMap
          incidents={snapshot.incidents}
          investigations={snapshot.investigations}
          crews={snapshot.crews}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[400] flex flex-wrap gap-2">
          <Kpi label="Open incidents" value={String(roi.openIncidents)} />
          <Kpi label="Izinyoka queue" value={String(roi.openInvestigations)} tone="gold" />
          <Kpi label="Recovered" value={formatZar(roi.recoveredZar)} tone="gold" />
          <Kpi label="Fleet saved" value={formatZar(roi.fleetSavingsZar)} />
          <Kpi label="MTTD" value={formatMinutes(roi.mttdMinutes)} />
        </div>
        {liveEvent ? (
          <div className="absolute bottom-3 left-3 z-[400] max-w-md rounded-lg border border-primary/30 bg-background/90 px-3 py-2 text-xs shadow-lg backdrop-blur">
            <div className="text-primary font-medium">{liveEvent.title}</div>
            <div className="text-muted-foreground mt-0.5">{liveEvent.detail}</div>
          </div>
        ) : null}
      </section>

      <aside className="flex min-h-0 flex-col border-t border-border lg:border-t-0 lg:border-l">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div>
            <div className="text-xs font-medium">Priority queue</div>
            <div className="text-muted-foreground text-[11px]">
              500 m / 2 h spatial merge · live scoring
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => setDemoOpen((v) => !v)}>
            {demoOpen ? "Hide demo" : "Hackathon demo"}
          </Button>
        </div>

        {demoOpen ? <DemoRail /> : null}

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-2 p-3">
            {openIncidents.map((incident) => (
              <IncidentRow
                key={incident.id}
                incident={incident}
                reportCount={
                  snapshot.reports.filter((r) => r.masterIncidentId === incident.id)
                    .length
                }
                active={selectedId === incident.id}
                onClick={() => setSelectedId(incident.id)}
              />
            ))}
            <div className="text-muted-foreground pt-2 text-[11px] tracking-wide uppercase">
              Revenue protection
            </div>
            {snapshot.investigations
              .filter(
                (i) =>
                  i.status !== "closed_recovered" && i.status !== "closed_no_finding",
              )
              .map((inv) => (
                <InvestigationRow
                  key={inv.id}
                  inv={inv}
                  active={selectedId === inv.id}
                  onClick={() => setSelectedId(inv.id)}
                />
              ))}
          </div>
        </ScrollArea>

        {(selectedIncident || selectedInv) && (
          <DetailPane
            incident={selectedIncident}
            investigation={selectedInv}
            reportCount={
              selectedIncident
                ? snapshot.reports.filter(
                    (r) => r.masterIncidentId === selectedIncident.id,
                  ).length
                : 0
            }
          />
        )}
      </aside>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "gold";
}) {
  return (
    <div className="pointer-events-auto rounded-lg border border-border/80 bg-background/85 px-3 py-1.5 shadow backdrop-blur">
      <div className="text-muted-foreground text-[10px] tracking-wide uppercase">
        {label}
      </div>
      <div
        className={`tabular text-sm font-semibold ${tone === "gold" ? "text-gold" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}

function IncidentRow({
  incident,
  reportCount,
  active,
  onClick,
}: {
  incident: MasterIncident;
  reportCount: number;
  active: boolean;
  onClick: () => void;
}) {
  const band = priorityBand(incident.priorityScore);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
        active ? "border-primary/60 bg-primary/10" : "border-border bg-card hover:bg-muted/60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px]">{incident.reference}</span>
        <Badge
          variant={band === "critical" || band === "high" ? "destructive" : "secondary"}
        >
          {band} · {incident.priorityScore}
        </Badge>
      </div>
      <div className="mt-1 text-[12px] font-medium">{incident.suburb}</div>
      <div className="text-muted-foreground mt-0.5">
        {incident.affectedHouseholds} households · {reportCount} reports ·{" "}
        {classificationLabel(incident.classification)}
      </div>
      <div className="text-muted-foreground mt-0.5">
        {incident.status.replaceAll("_", " ")} · {relativeMinutes(incident.firstReportedAt)}
        {incident.criticalInfrastructure ? " · critical infra" : ""}
      </div>
    </button>
  );
}

function InvestigationRow({
  inv,
  active,
  onClick,
}: {
  inv: RevenueInvestigation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
        active ? "border-gold/60 bg-gold/10" : "border-border bg-card hover:bg-muted/60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px]">{inv.reference}</span>
        <span className="text-gold tabular font-semibold">risk {inv.anomalyRiskScore}</span>
      </div>
      <div className="mt-1 text-[12px] font-medium">{inv.suburb}</div>
      <div className="text-muted-foreground mt-0.5">
        {inv.type.replaceAll("_", " ")} · {inv.status.replaceAll("_", " ")}
        {inv.daysZeroConsumption ? ` · ${inv.daysZeroConsumption}d silent` : ""}
      </div>
    </button>
  );
}

function DetailPane({
  incident,
  investigation,
  reportCount,
}: {
  incident?: MasterIncident;
  investigation?: RevenueInvestigation;
  reportCount: number;
}) {
  async function dispatch(kind: "outage" | "investigation", targetId: string) {
    await postJson("/api/dispatch", { kind, targetId });
  }

  if (incident) {
    return (
      <div className="border-t border-border p-3 text-xs">
        <div className="font-medium">{incident.address}</div>
        <div className="text-muted-foreground mt-1">
          {reportCount} channelled reports spatially merged · score{" "}
          {incident.priorityScore}
        </div>
        {incident.status === "open" || incident.status === "clustered" ? (
          <Button
            size="sm"
            className="mt-2"
            onClick={() => dispatch("outage", incident.id)}
          >
            Dispatch nearest technician
          </Button>
        ) : (
          <div className="text-primary mt-2">
            {incident.status.replaceAll("_", " ")}
          </div>
        )}
      </div>
    );
  }

  if (investigation) {
    return (
      <div className="border-t border-border p-3 text-xs">
        <div className="font-medium">{investigation.address}</div>
        <div className="text-muted-foreground mt-1">{investigation.notes}</div>
        {investigation.status === "flagged" ? (
          <Button
            size="sm"
            className="mt-2"
            onClick={() => dispatch("investigation", investigation.id)}
          >
            Dispatch revenue inspector
          </Button>
        ) : (
          <div className="text-gold mt-2">
            {investigation.status.replaceAll("_", " ")}
            {investigation.fineAmountZar
              ? ` · ${formatZar(
                  investigation.fineAmountZar +
                    investigation.backbillZar +
                    investigation.penaltyZar,
                )}`
              : ""}
          </div>
        )}
      </div>
    );
  }

  return null;
}
