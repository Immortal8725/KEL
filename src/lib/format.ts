import type { OutageClassification, UserRole } from "./types";

const zarFmt = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

export function formatZar(amount: number): string {
  return zarFmt.format(amount);
}

export function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeMinutes(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return `${hours}h ago`;
}

export function classificationLabel(value: OutageClassification): string {
  return value.replaceAll("_", " ");
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "revenue_inspector":
      return "Revenue inspector";
    case "dispatcher":
      return "Dispatcher";
    case "technician":
      return "Technician";
    case "executive":
      return "Executive";
    case "resident":
      return "Resident";
    default:
      return "System";
  }
}

export function actionLabel(action: string): string {
  return action.replaceAll("_", " ").toLowerCase();
}

export function formatMinutes(value: number | null): string {
  if (value === null) return "—";
  if (value < 60) return `${value} min`;
  const h = Math.floor(value / 60);
  const m = Math.round(value % 60);
  return `${h}h ${m}m`;
}
