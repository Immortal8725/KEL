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
 * crews are excluded. Equivalent SQL: `recommend_crew()` in db/schema.sql.
 */

import { distanceMetres, etaMinutes } from "../geo";
import type {
  DispatchRecommendation,
  FieldCrew,
  GeoPoint,
  Specialization,
  User,
} from "../types";

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
  const userById = new Map(users.map((u) => [u.id, u]));

  return crews
    .filter((c) => c.specialization === spec)
    .filter((c) => c.status === "available" || c.status === "en_route")
    .map((crew) => {
      const distanceM = distanceMetres(crew.location, jobLocation);
      const score =
        Math.round(((distanceM / 1000) * 12 + crew.activeQueueSize * 18) * 100) /
        100;
      return {
        crewId: crew.id,
        callsign: crew.callsign,
        technicianName: userById.get(crew.userId)?.fullName ?? crew.callsign,
        specialization: crew.specialization,
        distanceM: Math.round(distanceM),
        queueSize: crew.activeQueueSize,
        score,
        etaMinutes: etaMinutes(distanceM),
      };
    })
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
