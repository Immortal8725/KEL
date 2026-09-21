"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMinutes, formatZar } from "@/lib/format";
import { usePlatform } from "@/lib/use-platform";

export function AnalyticsView() {
  const { roi, snapshot } = usePlatform();

  if (!roi || !snapshot) {
    return <div className="text-muted-foreground p-8 text-sm">Loading ROI…</div>;
  }

  const recoveredMax = Math.max(roi.recoveredZar, 1);
  const bars = [
    { label: "Tamper fines", value: roi.finesZar, color: "bg-gold" },
    { label: "Back-billed usage", value: roi.backbillZar, color: "bg-primary" },
    { label: "Penalty fees", value: roi.penaltyZar, color: "bg-destructive" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="text-[10px] tracking-[0.2em] text-primary uppercase">
        Office of the CFO
      </div>
      <h1 className="font-heading text-2xl font-semibold">
        Commercial analytics · City of Tshwane
      </h1>
      <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
        Direct revenue recovered from tampering cases, plus operational savings
        from killing duplicate dispatches when reports cluster inside the 500 m
        geofence.
      </p>

      <div className="mt-6 rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 to-transparent p-6">
        <div className="text-muted-foreground text-xs tracking-wide uppercase">
          Total recovered revenue
        </div>
        <div className="text-gold tabular mt-1 text-4xl font-semibold tracking-tight md:text-6xl">
          {formatZar(roi.recoveredZar)}
        </div>
        <div className="text-muted-foreground mt-2 text-sm">
          {roi.closedRecovered} closed recoveries · {roi.openInvestigations} still
          in the Izinyoka queue
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Metric
          label="Fleet & overtime saved"
          value={formatZar(roi.fleetSavingsZar)}
          hint={`${roi.duplicateReportsAbsorbed} duplicate roll-outs avoided × R1,860`}
        />
        <Metric
          label="Mean time to dispatch"
          value={formatMinutes(roi.mttdMinutes)}
          hint="First report → crew assigned"
        />
        <Metric
          label="Mean time to repair"
          value={formatMinutes(roi.mttrMinutes)}
          hint="First report → supply restored"
        />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Recovered revenue mix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bars.map((bar) => (
            <div key={bar.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span>{bar.label}</span>
                <span className="tabular">{formatZar(bar.value)}</span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className={`h-full ${bar.color}`}
                  style={{ width: `${Math.max(4, (bar.value / recoveredMax) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Households covered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tabular text-3xl font-semibold">
              {roi.householdsProtected}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Unique households on open and resolved master incidents after
              spatial deduplication.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open vs restored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="tabular text-3xl font-semibold">
              {roi.openIncidents}
              <span className="text-muted-foreground text-lg"> open</span>
              <span className="mx-2 text-muted-foreground">/</span>
              {roi.resolvedIncidents}
              <span className="text-muted-foreground text-lg"> restored</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              SLA counters recompute on every assignment and technician
              sign-off.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-xs font-normal tracking-wide uppercase">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="tabular text-2xl font-semibold">{value}</div>
        <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
      </CardContent>
    </Card>
  );
}
