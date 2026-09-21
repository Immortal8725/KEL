import type { InvestigationType, OutageClassification } from "./types";

export const OUTAGE_REPORT_OPTIONS: {
  value: OutageClassification;
  label: string;
  short: string;
  hint: string;
}[] = [
  { value: "no_power", label: "No power — whole house or street", short: "No power", hint: "Lights and plugs are dead" },
  { value: "partial_outage", label: "Partial outage", short: "Partial", hint: "Some rooms or neighbours still have power" },
  { value: "voltage_fluctuation", label: "Lights dimming / surging", short: "Dimming", hint: "Voltage going up and down" },
  { value: "cable_fault", label: "Cable or line down", short: "Cable down", hint: "Wire on the ground or sparking" },
  { value: "transformer_fault", label: "Mini-sub / transformer", short: "Mini-sub", hint: "Box humming, smoking, or burnt" },
  { value: "streetlight", label: "Streetlight only", short: "Streetlight", hint: "House has power, the pole is dark" },
  { value: "meter_issue", label: "Prepaid meter not vending", short: "Meter", hint: "Token or meter error" },
  { value: "other", label: "Other (not listed)", short: "Other", hint: "Not on the list — type it in the box" },
];

export const TIP_REPORT_OPTIONS: {
  value: InvestigationType | "other";
  label: string;
  short: string;
  hint: string;
}[] = [
  { value: "illegal_connection", label: "Illegal overhead tap (Izinyoka)", short: "Izinyoka tap", hint: "Wire off the municipal line" },
  { value: "meter_tamper", label: "Meter bypass / broken seal", short: "Meter bypass", hint: "Jumper ahead of the meter" },
  { value: "izinyoka_tip", label: "Someone stealing electricity", short: "Theft", hint: "You saw a connection that should not be there" },
  { value: "zero_consumption", label: "House has power but never buys units", short: "Never vends", hint: "Lights on, prepaid never vends" },
  { value: "other", label: "Other (not listed)", short: "Other", hint: "Not on the list — type it in the box" },
];
