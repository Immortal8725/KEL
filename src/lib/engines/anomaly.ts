/**
 * Zero-consumption / Izinyoka anomaly engine.
 *
 * Trigger: an *active* prepaid meter with 0 kWh purchased for >= 60 days.
 * Cross-check: the linked feeder/transformer must be ENERGIZED — a dark
 * feeder would explain the silence, an energised one does not.
 *
 * Risk score (0–100):
 *   40  base (cleared the 60-day floor)
 * + up to 40 for days beyond 60 (0.8 pts / day, cap 50 extra days)
 * + 20 if the feeder is ENERGIZED (the confirming cross-check)
 *
 * Mirrors `zero_consumption_candidates` in db/schema.sql.
 */

import { newId, nowIso } from "../id";
import type {
  Feeder,
  Meter,
  RevenueInvestigation,
  VendingTelemetryLog,
} from "../types";
import { ZERO_CONSUMPTION_DAYS } from "../types";

export interface AnomalyHit {
  meter: Meter;
  feeder: Feeder;
  lastEnergyAt: string;
  daysZero: number;
  riskScore: number;
}

export function lastEnergyAt(
  meter: Meter,
  vending: VendingTelemetryLog[],
): string {
  const purchases = vending
    .filter((v) => v.meterId === meter.id && v.kwh > 0)
    .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt));
  return purchases[0]?.purchasedAt ?? meter.installedAt;
}

export function computeAnomalyRiskScore(
  daysZero: number,
  feederEnergized: boolean,
): number {
  const overFloor = Math.max(0, daysZero - ZERO_CONSUMPTION_DAYS);
  const durationPts = Math.min(40, overFloor * 0.8);
  const feederPts = feederEnergized ? 20 : 0;
  return Math.round(Math.min(100, Math.max(0, 40 + durationPts + feederPts)));
}

export function scanZeroConsumption(
  meters: Meter[],
  feeders: Feeder[],
  vending: VendingTelemetryLog[],
  now: Date = new Date(),
): AnomalyHit[] {
  const feederById = new Map(feeders.map((f) => [f.id, f]));
  const hits: AnomalyHit[] = [];

  for (const meter of meters) {
    if (meter.status !== "active") continue;
    const feeder = feederById.get(meter.feederId);
    if (!feeder) continue;
    // Cross-check: only flag when the local grid is live.
    if (feeder.status !== "ENERGIZED") continue;

    const energyAt = lastEnergyAt(meter, vending);
    const daysZero = Math.floor(
      (now.getTime() - new Date(energyAt).getTime()) / 86_400_000,
    );
    if (daysZero < ZERO_CONSUMPTION_DAYS) continue;

    hits.push({
      meter,
      feeder,
      lastEnergyAt: energyAt,
      daysZero,
      riskScore: computeAnomalyRiskScore(daysZero, true),
    });
  }

  return hits.sort((a, b) => b.riskScore - a.riskScore);
}

export function investigationFromHit(
  hit: AnomalyHit,
  existing: RevenueInvestigation[],
): RevenueInvestigation | null {
  const already = existing.find(
    (inv) =>
      inv.meterId === hit.meter.id &&
      inv.status !== "closed_no_finding" &&
      inv.status !== "closed_recovered",
  );
  if (already) return null;

  return {
    id: newId("inv"),
    reference: nextInvestigationReference(existing),
    type: "zero_consumption",
    status: "flagged",
    meterId: hit.meter.id,
    feederId: hit.feeder.id,
    location: hit.meter.location,
    address: hit.meter.address,
    suburb: hit.meter.suburb,
    anomalyRiskScore: hit.riskScore,
    daysZeroConsumption: hit.daysZero,
    assignedCrewId: null,
    dispatchedAt: null,
    onSiteAt: null,
    fineAmountZar: 0,
    backbillZar: 0,
    penaltyZar: 0,
    evidence: [],
    notes: `Active prepaid meter ${hit.meter.meterNumber} (acct ${hit.meter.accountNumber}) has purchased 0 kWh for ${hit.daysZero} days while feeder ${hit.feeder.code} is ENERGIZED. Suspected meter bypass / Izinyoka.`,
    createdAt: nowIso(),
    closedAt: null,
  };
}

export function nextInvestigationReference(
  existing: RevenueInvestigation[],
): string {
  const year = new Date().getFullYear();
  const seq = existing.length + 1;
  return `TSH-RP-${year}-${String(seq).padStart(4, "0")}`;
}

/** Estimate back-billed usage: suburb average daily kWh * silent days * tariff. */
export function estimateBackbillZar(
  daysZero: number,
  tariffCentsKwh: number,
  avgDailyKwh = 9.4,
): number {
  const kwh = daysZero * avgDailyKwh;
  return Math.round((kwh * tariffCentsKwh) / 100);
}
