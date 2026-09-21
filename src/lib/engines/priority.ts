/**
 * Dynamic priority scoring for master outage incidents.
 *
 *   Priority Score = (Affected Households * w1)
 *                  + (Critical Infrastructure Flag * w2)
 *                  + (Elapsed Time minutes * w3)
 *
 * Mirrors `compute_priority_score()` in db/schema.sql. Weights live on the
 * store so the control room can retune without a code change.
 */

import type { MasterIncident, PriorityWeights } from "../types";
import { DEFAULT_WEIGHTS } from "../types";

export function computePriorityScore(
  households: number,
  critical: boolean,
  firstReportedAt: string,
  now: Date = new Date(),
  weights: PriorityWeights = DEFAULT_WEIGHTS,
): number {
  const elapsedMinutes = Math.max(
    0,
    (now.getTime() - new Date(firstReportedAt).getTime()) / 60_000,
  );
  const raw =
    households * weights.wHouseholds +
    (critical ? 1 : 0) * weights.wCritical +
    elapsedMinutes * weights.wElapsed;
  return Math.round(raw * 100) / 100;
}

export function refreshIncidentPriority(
  incident: MasterIncident,
  now: Date = new Date(),
  weights: PriorityWeights = DEFAULT_WEIGHTS,
): MasterIncident {
  return {
    ...incident,
    priorityScore: computePriorityScore(
      incident.affectedHouseholds,
      incident.criticalInfrastructure,
      incident.firstReportedAt,
      now,
      weights,
    ),
  };
}

export function priorityBand(
  score: number,
): "critical" | "high" | "medium" | "low" {
  if (score >= 400) return "critical";
  if (score >= 220) return "high";
  if (score >= 80) return "medium";
  return "low";
}
