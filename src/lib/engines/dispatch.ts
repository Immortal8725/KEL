/**
 * Constraint-based field-force dispatch.
 *
 * Open tickets are auto-assigned. Ranking (lowest score wins):
 *   score = (missing_required_skills * 120) + (distance_km * 12) + (queue * 10)
 *
 * Skill is the first gate: a certified van beats a closer van that cannot
 * do the work. Proximity then queue break remaining ties.
 * Off-duty crews are excluded. Specialisation still has to match the job
 * type (maintenance vs revenue protection). Dispatcher can override.
 * Equivalent SQL: `recommend_crew()` in db/schema.sql.
 */

import { distanceMetres, etaMinutes } from "../geo";
import type {
  DispatchRecommendation,
  FieldCrew,
  GeoPoint,
  InvestigationType,
  OutageClassification,
  Specialization,
  User,
} from "../types";

export type JobKind = "outage" | "investigation";

const OUTAGE_SKILLS: Partial<Record<OutageClassification, string[]>> = {
  cable_fault: ["CABLE_FAULT", "MV_JOINTING"],
  transformer_fault: ["MINI_SUB"],
  streetlight: ["STREETLIGHT"],
  no_power: ["OHL_REPAIR", "LV_BOARD"],
  partial_outage: ["OHL_REPAIR", "LV_BOARD"],
  voltage_fluctuation: ["OHL_REPAIR", "LV_BOARD"],
  meter_issue: ["LV_BOARD"],
};

const INVESTIGATION_SKILLS: Record<InvestigationType, string[]> = {
  izinyoka_tip: ["IZINYOKA"],
  illegal_connection: ["IZINYOKA"],
  meter_tamper: ["METER_TAMPER"],
  zero_consumption: ["PREPAID_AUDIT", "METER_TAMPER"],
};

export function specializationForJob(kind: JobKind): Specialization {
  return kind === "investigation" ? "revenue_protection" : "maintenance";
}

export function requiredSkillsForJob(
  kind: JobKind,
  jobType?: OutageClassification | InvestigationType | string | null,
): string[] {
  if (!jobType) return [];
  if (kind === "investigation") {
    return INVESTIGATION_SKILLS[jobType as InvestigationType] ?? ["METER_TAMPER"];
  }
  return OUTAGE_SKILLS[jobType as OutageClassification] ?? [];
}

export function recommendationForCrew(
  crew: FieldCrew,
  users: User[],
  jobLocation: GeoPoint,
  requiredSkills: string[] = [],
): DispatchRecommendation {
  const distanceM = distanceMetres(crew.location, jobLocation);
  const matchedSkills = requiredSkills.filter((s) =>
    crew.skillCertifications.includes(s),
  );
  const missingSkills = requiredSkills.filter(
    (s) => !crew.skillCertifications.includes(s),
  );
  const score =
    Math.round(
      (missingSkills.length * 120 +
        (distanceM / 1000) * 12 +
        crew.activeQueueSize * 10) *
        100,
    ) / 100;
  const km = Math.round(distanceM / 100) / 10;
  const skillBit = requiredSkills.length
    ? missingSkills.length === 0
      ? `${matchedSkills.join(", ")} certified`
      : `missing ${missingSkills.join(", ")}`
    : "any skill";
  return {
    crewId: crew.id,
    callsign: crew.callsign,
    technicianName: users.find((u) => u.id === crew.userId)?.fullName ?? crew.callsign,
    specialization: crew.specialization,
    distanceM: Math.round(distanceM),
    queueSize: crew.activeQueueSize,
    score,
    etaMinutes: etaMinutes(distanceM),
    matchedSkills,
    missingSkills,
    reason: `${skillBit} · ${km} km · queue ${crew.activeQueueSize}`,
  };
}

export function recommendCrews(
  crews: FieldCrew[],
  users: User[],
  jobLocation: GeoPoint,
  kind: JobKind,
  limit = 5,
  requiredSkills: string[] = [],
): DispatchRecommendation[] {
  const spec = specializationForJob(kind);

  return crews
    .filter((c) => c.specialization === spec)
    .filter((c) => c.status !== "off_duty")
    .map((crew) =>
      recommendationForCrew(crew, users, jobLocation, requiredSkills),
    )
    .sort((a, b) => a.score - b.score || a.distanceM - b.distanceM)
    .slice(0, limit);
}

export function pickBestCrew(
  crews: FieldCrew[],
  users: User[],
  jobLocation: GeoPoint,
  kind: JobKind,
  requiredSkills: string[] = [],
): DispatchRecommendation | null {
  return recommendCrews(crews, users, jobLocation, kind, 1, requiredSkills)[0] ?? null;
}
