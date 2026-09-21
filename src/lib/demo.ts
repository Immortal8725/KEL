/**
 * Scripted hackathon demo sequence. Each step mutates the live store so the
 * command-centre map, audit trail, and ROI dashboard update in real time.
 *
 * Act 1 — three Mamelodi reports collapse into one master ticket (500 m / 2 h).
 * Act 2 — zero-consumption scan flags the silent ENERGIZED meter.
 * Act 3 — inspector on-site, evidence, tamper fine.
 * Act 4 — ROI roll-up in ZAR.
 */

import { evidenceSvg } from "./evidence";
import { getStore } from "./store";
import type { IngestReportInput } from "./types";

export const MAMELODI_CLUSTER: IngestReportInput[] = [
  {
    accountNumber: "3218840441",
    reporterName: "Sibusiso Mabena",
    contactPhone: "+27 82 441 0190",
    location: { lon: 28.394, lat: -25.7234 },
    address: "12 Tsamaya Road, Mamelodi Ext 11",
    suburb: "Mamelodi",
    classification: "no_power",
    channel: "app",
    notes: "Whole street dark. Mini-sub humming then stopped.",
    feederId: "fdr_mam_12",
  },
  {
    accountNumber: "3218840519",
    reporterName: "Grace Skosana",
    contactPhone: "+27 72 118 4402",
    location: { lon: 28.39545, lat: -25.72418 },
    address: "41 Tsamaya Road, Mamelodi Ext 11",
    suburb: "Mamelodi",
    classification: "no_power",
    channel: "whatsapp",
    notes: "No power since 19:40. Neighbours also out.",
    feederId: "fdr_mam_12",
  },
  {
    accountNumber: "3218840602",
    reporterName: "Clinic night staff",
    contactPhone: "+27 12 801 4411",
    location: { lon: 28.39615, lat: -25.72255 },
    address: "Mamelodi East Clinic, Tsamaya Road",
    suburb: "Mamelodi",
    classification: "cable_fault",
    channel: "call_centre",
    notes: "Clinic on generator. Flag as critical community infrastructure.",
    criticalInfrastructure: true,
    feederId: "fdr_mam_12",
  },
];

export type DemoAct = 1 | 2 | 3 | 4;

export function runDemoStep(step: string) {
  const store = getStore();

  switch (step) {
    case "reset": {
      store.reset();
      return { ok: true, step, message: "Ops floor reset to the Tshwane baseline." };
    }
    case "cluster_1": {
      const result = store.ingest(MAMELODI_CLUSTER[0]);
      if (result.kind !== "outage") return { ok: false, step, message: "Expected an outage ticket." };
      return {
        ok: true,
        step,
        message: `Report 1 opened ${result.incident.reference}.`,
        incidentId: result.incident.id,
        merged: result.merged,
      };
    }
    case "cluster_2": {
      const result = store.ingest(MAMELODI_CLUSTER[1]);
      if (result.kind !== "outage") return { ok: false, step, message: "Expected an outage ticket." };
      return {
        ok: true,
        step,
        message: `Report 2 merged (${result.matchDistanceM} m) · ${result.incident.affectedHouseholds} households.`,
        incidentId: result.incident.id,
        merged: result.merged,
        matchDistanceM: result.matchDistanceM,
      };
    }
    case "cluster_3": {
      const result = store.ingest(MAMELODI_CLUSTER[2]);
      if (result.kind !== "outage") return { ok: false, step, message: "Expected an outage ticket." };
      return {
        ok: true,
        step,
        message: `Report 3 clustered. Clinic flagged critical · score ${result.incident.priorityScore}.`,
        incidentId: result.incident.id,
        merged: result.merged,
        matchDistanceM: result.matchDistanceM,
        households: result.incident.affectedHouseholds,
        priorityScore: result.incident.priorityScore,
      };
    }
    case "scan": {
      const { created, hits } = store.scanAnomalies();
      return {
        ok: true,
        step,
        message:
          created.length > 0
            ? `Scanner opened ${created[0].reference} · risk ${created[0].anomalyRiskScore}.`
            : hits.length === 0
              ? "No new zero-consumption anomalies on energised feeders."
              : "Candidates already have open investigation tickets.",
        investigationId: created[0]?.id ?? null,
        created: created.length,
        hits: hits.length,
      };
    }
    case "dispatch_outage": {
      const mamelodi = store.incidents.find((i) => i.suburb === "Mamelodi" && i.status !== "resolved");
      if (!mamelodi) return { ok: false, step, message: "Run the cluster steps first." };
      const result = store.dispatch("outage", mamelodi.id);
      return {
        ok: true,
        step,
        message: `${result.recommendation.callsign} en route · ETA ${result.recommendation.etaMinutes} min.`,
        incidentId: mamelodi.id,
        etaMinutes: result.recommendation.etaMinutes,
      };
    }
    case "dispatch_investigation": {
      const inv =
        store.investigations.find(
          (i) => i.type === "zero_consumption" && i.status === "flagged",
        ) ?? store.investigations.find((i) => i.status === "flagged");
      if (!inv) return { ok: false, step, message: "Run the anomaly scan first." };
      const result = store.dispatch("investigation", inv.id);
      return {
        ok: true,
        step,
        message: `${result.recommendation.callsign} (${result.recommendation.technicianName}) assigned.`,
        investigationId: inv.id,
      };
    }
    case "inspector_onsite": {
      const inv = latestOpenInvestigation(store);
      if (!inv) return { ok: false, step, message: "No investigation to arrive at." };
      store.markOnSite("investigation", inv.id);
      return { ok: true, step, message: `Inspector on site at ${inv.address}.`, investigationId: inv.id };
    }
    case "evidence": {
      const inv = latestOpenInvestigation(store);
      if (!inv) return { ok: false, step, message: "No investigation for evidence." };
      store.addEvidence(inv.id, {
        caption: "Prepaid meter bypassed — jumper ahead of the CT",
        dataUri: evidenceSvg(
          "Meter bypass · Mamelodi East",
          "Live tails bridged in the kiosk. 0 kWh vended, feeder ENERGIZED.",
        ),
        capturedAt: new Date().toISOString(),
        capturedBy: "usr_nomsa",
      });
      store.addEvidence(inv.id, {
        caption: "Illegal overhead tap (Izinyoka) feeding the yard",
        dataUri: evidenceSvg(
          "Izinyoka tap",
          "Unauthorised ABC tap off the 11 kV spur behind the dwelling.",
        ),
        capturedAt: new Date().toISOString(),
        capturedBy: "usr_nomsa",
      });
      return {
        ok: true,
        step,
        message: "Two evidence photos hashed into the audit chain.",
        investigationId: inv.id,
      };
    }
    case "fine": {
      const inv = latestOpenInvestigation(store);
      if (!inv) return { ok: false, step, message: "No investigation to fine." };
      const updated = store.issueFine(inv.id);
      store.closeInvestigation(inv.id, "closed_recovered");
      const total = updated.fineAmountZar + updated.backbillZar + updated.penaltyZar;
      return {
        ok: true,
        step,
        message: `Tamper fine issued · R${total.toLocaleString("en-ZA")} recovered.`,
        investigationId: inv.id,
        totalZar: total,
      };
    }
    case "complete_outage": {
      const mamelodi = store.incidents.find(
        (i) => i.suburb === "Mamelodi" && i.status !== "resolved" && i.status !== "closed",
      );
      if (!mamelodi) return { ok: false, step, message: "No open Mamelodi incident." };
      if (mamelodi.status === "open" || mamelodi.status === "clustered") {
        store.dispatch("outage", mamelodi.id);
      }
      store.markOnSite("outage", mamelodi.id);
      store.completeOutage(
        mamelodi.id,
        "Replaced failed 11 kV cable joint on Tsamaya spur. Clinic back on municipal supply.",
      );
      return { ok: true, step, message: `${mamelodi.reference} restored.` };
    }
    default:
      return { ok: false, step, message: `Unknown demo step: ${step}` };
  }
}

function latestOpenInvestigation(store: ReturnType<typeof getStore>) {
  return [...store.investigations]
    .reverse()
    .find(
      (i) =>
        i.status !== "closed_no_finding" &&
        i.status !== "closed_recovered",
    );
}

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
