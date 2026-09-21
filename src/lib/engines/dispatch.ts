/**
 * Constraint-based field-force dispatch.
 *
 * Maintenance technicians are matched to physical equipment / cable faults.
 * Revenue protection investigators are matched to high-risk zero-consumption
 * houses and anonymous Izinyoka tip-offs.
 *
 * Ranking (lowest score wins):
 *   score = (distance_km * 12) + (active_queue_size * 18)
 *
 * Only crews whose specialisation matches the job are considered. Off-duty
 * crews are excluded. Dispatcher can pin a named van; that job lands on the
 * technician immediately. Equivalent SQL: `recommend_crew()` in db/schema.sql.
 */

import { distanceMetres, etaMinutes } from "../geo";
import type {
  DispatchRecommendation,
  FieldCrew,
  GeoPoint,
  Specialization,
  User,
} from "../types";

export function recommendationForCrew(
  crew: FieldCrew,
  users: User[],
  jobLocation: GeoPoint,
): DispatchRecommendation {
  const distanceM = distanceMetres(crew.location, jobLocation);
  const score =
    Math.round(((distanceM / 1000) * 12 + crew.activeQueueSize * 18) * 100) / 100;
  return {
    crewId: crew.id,
    callsign: crew.callsign,
    technicianName: users.find((u) => u.id === crew.userId)?.fullName ?? crew.callsign,
    specialization: crew.specialization,
    distanceM: Math.round(distanceM),
    queueSize: crew.activeQueueSize,
    score,
    etaMinutes: etaMinutes(distanceM),
  };
}

export type JobKind = "outage" | "investigation";

export function specializationForJob(kind: JobKind): Specialization {
  return kind === "investigation" ? "revenue_protection" : "maintenance";
}

export function recommendCrews(
  crews: FieldCrew[],
  users: User[],
  jobLocation: GeoPoint,
  kind: JobKind,
  limit = 5,
): DispatchRecommendation[] {
  const spec = specializationForJob(kind);

  return crews
    .filter((c) => c.specialization === spec)
    .filter((c) => c.status !== "off_duty")
    .map((crew) => recommendationForCrew(crew, users, jobLocation))
    .sort((a, b) => a.score - b.score || a.distanceM - b.distanceM)
    .slice(0, limit);
}

export function pickBestCrew(
  crews: FieldCrew[],
  users: User[],
  jobLocation: GeoPoint,
  kind: JobKind,
): DispatchRecommendation | null {
  return recommendCrews(crews, users, jobLocation, kind, 1)[0] ?? null;
}
