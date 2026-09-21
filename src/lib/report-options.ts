import type { InvestigationType, OutageClassification } from "./types";

export const OUTAGE_REPORT_OPTIONS: {
  value: OutageClassification;
  label: string;
  hint: string;
}[] = [
  { value: "no_power", label: "No power — whole house or street", hint: "Lights and plugs are dead" },
  { value: "partial_outage", label: "Partial outage", hint: "Some rooms or neighbours still have power" },
  { value: "voltage_fluctuation", label: "Lights dimming / surging", hint: "Voltage going up and down" },
  { value: "cable_fault", label: "Cable or line down", hint: "Wire on the ground or sparking" },
  { value: "transformer_fault", label: "Mini-sub / transformer", hint: "Box humming, smoking, or burnt" },
  { value: "streetlight", label: "Streetlight only", hint: "House has power, the pole is dark" },
  { value: "meter_issue", label: "Prepaid meter not vending", hint: "Token or meter error" },
  { value: "other", label: "Other (not listed)", hint: "Describe it in the box below" },
];

export const TIP_REPORT_OPTIONS: {
  value: InvestigationType | "other";
  label: string;
  hint: string;
}[] = [
  { value: "illegal_connection", label: "Illegal overhead tap (Izinyoka)", hint: "Wire off the municipal line" },
  { value: "meter_tamper", label: "Meter bypass / broken seal", hint: "Jumper ahead of the meter" },
  { value: "izinyoka_tip", label: "Someone stealing electricity", hint: "You saw a connection that should not be there" },
  { value: "zero_consumption", label: "House has power but never buys units", hint: "Lights on, prepaid never vends" },
  { value: "other", label: "Other (not listed)", hint: "Describe it in the box below" },
];

export const SELECT_CLASS =
  "border-input bg-input/30 h-9 w-full rounded-lg border px-2 text-sm";
