"use client";

import { DemoRail } from "@/components/demo-rail";
import { formatZar } from "@/lib/format";
import { usePlatform } from "@/lib/use-platform";

export function DemoStage() {
  const { snapshot, roi, liveEvent } = usePlatform();
  const cluster = snapshot?.incidents.find((i) => i.suburb === "Mamelodi");
  const reports = cluster
    ? snapshot?.reports.filter((r) => r.masterIncidentId === cluster.id) ?? []
    : [];
  const anomaly = snapshot?.investigations.find((i) => i.type === "zero_consumption");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-[10px] tracking-[0.2em] text-primary uppercase">
        Tshwane Varsity Hackathon
      </div>
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        ElectroRaid · four-act live demo
      </h1>
      <p className="text-muted-foreground mt-2 max-w-2xl text-sm">
        Hit play and watch the same store that powers the command map, the
        field PWA, the audit ledger, and the CFO dashboard. Nothing here is
        canned animation — each step is a real API call.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <DemoRail />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <ActCard
          n="1"
          title="Spatial clustering"
          body={
            cluster
              ? `${reports.length} reports → ${cluster.reference} · ${cluster.affectedHouseholds} households · score ${cluster.priorityScore}`
              : "Waiting for Tsamaya Road reports."
          }
        />
        <ActCard
          n="2"
          title="Zero-consumption flag"
          body={
            anomaly
              ? `${anomaly.reference} · ${anomaly.daysZeroConsumption} days silent · risk ${anomaly.anomalyRiskScore}`
              : "Scanner has not opened a new Izinyoka ticket yet."
          }
        />
        <ActCard
          n="3"
          title="Audit trail"
          body={
            anomaly
              ? `${anomaly.evidence.length} photos · status ${anomaly.status.replaceAll("_", " ")}`
              : "Inspector actions will hash in as Act 3 runs."
          }
        />
        <ActCard
          n="4"
          title="Recovered revenue"
          body={roi ? formatZar(roi.recoveredZar) : "—"}
          gold
        />
      </div>

      {liveEvent ? (
        <p className="text-primary mt-6 text-sm">
          Live: {liveEvent.title} — {liveEvent.detail}
        </p>
      ) : null}

      <Architecture />
    </div>
  );
}

function ActCard({
  n,
  title,
  body,
  gold,
}: {
  n: string;
  title: string;
  body: string;
  gold?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-muted-foreground text-[10px] tracking-wide uppercase">
        Act {n}
      </div>
      <div className="font-medium">{title}</div>
      <div className={`mt-2 text-sm ${gold ? "text-gold tabular text-2xl font-semibold" : "text-muted-foreground"}`}>
        {body}
      </div>
    </div>
  );
}

function Architecture() {
  return (
    <div className="mt-10 rounded-xl border border-border p-4 text-xs">
      <div className="font-medium">Runtime architecture (this prototype)</div>
      <pre className="text-muted-foreground mt-3 overflow-x-auto font-mono leading-6">
{`Residents / Call centre / WhatsApp
        │  POST /api/reports
        ▼
 Spatial dedup (500 m, 2 h) ──► master_incidents + outage_reports
        │
        ├── Priority score = hh·w1 + critical·w2 + minutes·w3
        │
        ├── Dispatch (nearest + queue + specialisation)
        │         ├─ Technicians  → equipment faults
        │         └─ RP inspectors → Izinyoka / zero-kWh
        │
 Vending telemetry ──► anomaly scan (0 kWh ≥ 60d AND feeder ENERGIZED)
        │
        └── append-only SHA-256 audit chain
                    │
                    └── ROI: fines + back-bill + penalties + avoided dispatches`}
      </pre>
      <p className="text-muted-foreground mt-3">
        Production maps this store onto PostgreSQL + PostGIS. The SQL contract
        lives in <code className="text-foreground">db/schema.sql</code>.
      </p>
    </div>
  );
}
