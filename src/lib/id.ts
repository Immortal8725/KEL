export function newId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${rand}`;
}

export function hoursAgo(hours: number, from = new Date()): string {
  return new Date(from.getTime() - hours * 3_600_000).toISOString();
}

export function daysAgo(days: number, from = new Date()): string {
  return new Date(from.getTime() - days * 86_400_000).toISOString();
}

export function minutesAgo(minutes: number, from = new Date()): string {
  return new Date(from.getTime() - minutes * 60_000).toISOString();
}

export function nowIso(): string {
  return new Date().toISOString();
}
