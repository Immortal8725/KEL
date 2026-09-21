export const DEMO_SCRIPT = [
  { id: "reset", act: 0, label: "Reset ops floor" },
  { id: "cluster_1", act: 1, label: "Resident report · Tsamaya Rd" },
  { id: "cluster_2", act: 1, label: "Neighbour report · 180 m away" },
  { id: "cluster_3", act: 1, label: "Clinic call · cluster + critical flag" },
  { id: "scan", act: 2, label: "Run zero-consumption scanner" },
  { id: "dispatch_investigation", act: 2, label: "Dispatch revenue inspector" },
  { id: "inspector_onsite", act: 3, label: "Inspector arrives on site" },
  { id: "evidence", act: 3, label: "Upload tamper evidence" },
  { id: "fine", act: 3, label: "Issue fine + back-bill" },
  { id: "dispatch_outage", act: 3, label: "Dispatch maintenance to cluster" },
  { id: "complete_outage", act: 3, label: "Technician signs off restoration" },
] as const;
