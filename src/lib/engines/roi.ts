/**
 * Commercial analytics & municipal ROI.
 *
 *   Fleet savings     — avoided duplicate dispatches (merged reports) ×
 *                       estimated fuel+overtime cost per roll-out.
 *   Revenue recovered — tampering fines + back-billed usage + penalties.
 *   MTTD / MTTR       — mean time to dispatch / repair across resolved jobs.
 */

import type {
  MasterIncident,
  OutageReport,
  RevenueInvestigation,
} from "../types";

const COST_PER_DISPATCH_ZAR = 1860;

export interface RoiMetrics {
  recoveredZar: number;
  finesZar: number;
  backbillZar: number;
  penaltyZar: number;
  openInvestigations: number;
  closedRecovered: number;
  duplicateReportsAbsorbed: number;
  fleetSavingsZar: number;
  openIncidents: number;
  resolvedIncidents: number;
  mttdMinutes: number | null;
  mttrMinutes: number | null;
  householdsProtected: number;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function minutesBetween(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / 60_000;
}

export function computeRoi(
  incidents: MasterIncident[],
  reports: OutageReport[],
  investigations: RevenueInvestigation[],
): RoiMetrics {
  const recoveredCases = investigations.filter(
    (i) =>
      i.status === "fine_issued" ||
      i.status === "closed_recovered" ||
      i.fineAmountZar + i.backbillZar + i.penaltyZar > 0,
  );

  const finesZar = round2(sum(recoveredCases.map((i) => i.fineAmountZar)));
  const backbillZar = round2(sum(recoveredCases.map((i) => i.backbillZar)));
  const penaltyZar = round2(sum(recoveredCases.map((i) => i.penaltyZar)));

  const reportsByIncident = new Map<string, number>();
  for (const r of reports) {
    reportsByIncident.set(
      r.masterIncidentId,
      (reportsByIncident.get(r.masterIncidentId) ?? 0) + 1,
    );
  }
  let duplicates = 0;
  for (const count of reportsByIncident.values()) {
    duplicates += Math.max(0, count - 1);
  }

  const resolved = incidents.filter(
    (i) => i.status === "resolved" || i.status === "closed",
  );
  const mttd = mean(
    incidents
      .filter((i) => i.dispatchedAt)
      .map((i) => minutesBetween(i.firstReportedAt, i.dispatchedAt as string)),
  );
  const mttr = mean(
    resolved
      .filter((i) => i.resolvedAt)
      .map((i) => minutesBetween(i.firstReportedAt, i.resolvedAt as string)),
  );

  const open = incidents.filter(
    (i) => i.status !== "resolved" && i.status !== "closed",
  );

  return {
    recoveredZar: round2(finesZar + backbillZar + penaltyZar),
    finesZar,
    backbillZar,
    penaltyZar,
    openInvestigations: investigations.filter(
      (i) => i.status !== "closed_no_finding" && i.status !== "closed_recovered",
    ).length,
    closedRecovered: investigations.filter(
      (i) => i.status === "closed_recovered" || i.status === "fine_issued",
    ).length,
    duplicateReportsAbsorbed: duplicates,
    fleetSavingsZar: duplicates * COST_PER_DISPATCH_ZAR,
    openIncidents: open.length,
    resolvedIncidents: resolved.length,
    mttdMinutes: mttd,
    mttrMinutes: mttr,
    householdsProtected: incidents.reduce(
      (acc, i) => acc + i.affectedHouseholds,
      0,
    ),
  };
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export { COST_PER_DISPATCH_ZAR };
