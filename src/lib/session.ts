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
      "Open tickets auto-assign by skill then proximity. Watch the live map and override a van only if the engine is wrong.",
    duties: ["Auto-dispatch", "Live map", "Override"],
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
      "The engine assigns you by skill and proximity. Follow the van-to-job map, log on site, and sign off.",
    duties: ["Assigned jobs", "Live map", "Sign off"],
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
      "Skill + proximity puts audits on your kit with a live map to the meter. Photograph the tamper, issue the fine, and score technician repairs.",
    duties: ["Live map", "Izinyoka", "Repair QA"],
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
