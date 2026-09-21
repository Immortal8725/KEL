import type { UserRole } from "./types";

export const DEMO_PASSWORD = "gridpulse";

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
    blurb: "Report outages, send anonymous Izinyoka tips, track the crew ETA.",
    duties: ["Outage report", "Anonymous tip", "Live ETA"],
  },
  {
    id: "usr_thandiwe",
    name: "Thandiwe Nkosi",
    role: "dispatcher",
    title: "Control room dispatcher",
    email: "t.nkosi@tshwane.gov.za",
    home: "/ops",
    blurb: "Live PostGIS map, clustered master tickets, dispatch, and ROI.",
    duties: ["Heatmap", "Dedup queue", "Assign crews"],
  },
  {
    id: "usr_sipho",
    name: "Sipho Dlamini",
    role: "technician",
    title: "Field technician · MT-12",
    email: "s.dlamini@tshwane.gov.za",
    home: "/tech",
    crewId: "crew_mt_mamelodi",
    blurb: "Repair jobs, En Route / On Site / Resolved, closure photos and serials.",
    duties: ["Navigate", "Status GPS", "Close with proof"],
  },
  {
    id: "usr_nomsa",
    name: "Nomsa Khumalo",
    role: "revenue_inspector",
    title: "Revenue protection investigator · RP-03",
    email: "n.khumalo@tshwane.gov.za",
    home: "/inspect",
    crewId: "crew_rp_east",
    blurb: "Zero-kWh audits, seal checks, photo evidence, digital tamper fines.",
    duties: ["Meter audit", "Izinyoka", "Issue fine"],
  },
];

export const SESSION_KEY = "gridpulse.demo.session";

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
      return [{ href: "/inspect", label: "Audits" }];
    case "executive":
      return [
        { href: "/analytics", label: "ROI" },
        { href: "/ops", label: "Command" },
      ];
    default:
      return [
        { href: "/ops", label: "Command" },
        { href: "/demo", label: "Demo" },
        { href: "/audit", label: "Audit" },
        { href: "/analytics", label: "ROI" },
      ];
  }
}

export function roleHome(role: UserRole): string {
  return PERSONAS.find((p) => p.role === role)?.home ?? "/ops";
}
