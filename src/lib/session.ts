import type { UserRole } from "./types";

export const SIGNIN_PASSWORD = "electroraid";

export interface DemoPersona {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  home: string;
  suburb?: string;
  accountNumber?: string;
  crewId?: string;
  blurb: string;
  duties: string[];
}

export const PERSONAS: DemoPersona[] = [
  {
    id: "usr_sibusiso",
    name: "Sibusiso Mabena",
    role: "resident",
    title: "Resident · Mamelodi Ext 11",
    email: "sibusiso@resident.tshwane",
    home: "/resident",
    suburb: "Mamelodi",
    accountNumber: "3218840441",
    blurb:
      "Report a fault, wait for dispatch, then track the technician live on a map (Bolt-style). Confirm when power is back.",
    duties: ["Report", "Live track van", "Confirm restore"],
  },
  {
    id: "usr_thandiwe",
    name: "Thandiwe Nkosi",
    role: "dispatcher",
    title: "Control room dispatcher",
    email: "t.nkosi@tshwane.gov.za",
    home: "/ops",
    blurb:
      "Assign a named technician to the resident’s ticket. The job lands on that handset immediately and the household tracks the van live.",
    duties: ["Assign technician", "Live map", "Work queue"],
  },
  {
    id: "usr_sipho",
    name: "Sipho Dlamini",
    role: "technician",
    title: "Field technician · MT-12",
    email: "s.dlamini@tshwane.gov.za",
    home: "/tech",
    crewId: "crew_mt_mamelodi",
    blurb:
      "The moment control room assigns your crew, the job appears here and the resident tracks your GPS.",
    duties: ["Assigned jobs", "On site", "Sign off"],
  },
  {
    id: "usr_nomsa",
    name: "Nomsa Khumalo",
    role: "revenue_inspector",
    title: "Revenue protection investigator · RP-03",
    email: "n.khumalo@tshwane.gov.za",
    home: "/inspect",
    crewId: "crew_rp_east",
    blurb:
      "Zero-kWh audits, seal checks, digital tamper fines, and quality-assurance scores on what the technician repaired.",
    duties: ["Meter audit", "Izinyoka", "Repair QA"],
  },
];

export const SESSION_KEY = "electroraid.session";

export function personaById(id: string): DemoPersona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export function personaByEmail(email: string): DemoPersona | undefined {
  return PERSONAS.find(
    (p) => p.email.toLowerCase() === email.trim().toLowerCase(),
  );
}

export type NavItem = { href: string; label: string };

export function navForRole(role: UserRole): NavItem[] {
  switch (role) {
    case "resident":
      return [{ href: "/resident", label: "My supply" }];
    case "technician":
      return [{ href: "/tech", label: "Jobs" }];
    case "revenue_inspector":
      return [{ href: "/inspect", label: "Audits & QA" }];
    case "executive":
      return [
        { href: "/analytics", label: "ROI" },
        { href: "/ops", label: "Command" },
      ];
    default:
      return [
        { href: "/ops", label: "Command" },
        { href: "/audit", label: "Audit" },
        { href: "/analytics", label: "ROI" },
      ];
  }
}

export function roleHome(role: UserRole): string {
  return PERSONAS.find((p) => p.role === role)?.home ?? "/ops";
}
