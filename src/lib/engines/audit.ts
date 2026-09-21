/**
 * Immutable activity log — "who did what".
 *
 * Every operational action (system flags, anonymous tips, dispatcher
 * assignments, on-site evidence, fines, component replacements) is appended
 * as a hash-chained row. The store never updates or deletes these records.
 *
 * entry_hash = SHA-256( prev_hash || canonical JSON payload )
 * Tampering with any historical row breaks the chain from that point on.
 */

import { createHash } from "crypto";
import type { AuditLog, GeoPoint, UserRole } from "../types";
import { newId, nowIso } from "../id";

export interface AuditWrite {
  actorId: string | null;
  actorRole: UserRole;
  actionType: string;
  entityType: string;
  entityId: string;
  location?: GeoPoint | null;
  payload: Record<string, unknown>;
  occurredAt?: string;
}

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonical).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`).join(",")}}`;
}

export function hashEntry(
  prevHash: string | null,
  payload: Record<string, unknown>,
  occurredAt: string,
  actionType: string,
  entityId: string,
): string {
  const material = `${prevHash ?? "GENESIS"}|${occurredAt}|${actionType}|${entityId}|${canonical(payload)}`;
  return createHash("sha256").update(material).digest("hex");
}

export function appendAudit(existing: AuditLog[], write: AuditWrite): AuditLog {
  const last = existing[existing.length - 1];
  const occurredAt = write.occurredAt ?? nowIso();
  const prevHash = last?.entryHash ?? null;
  const entryHash = hashEntry(
    prevHash,
    write.payload,
    occurredAt,
    write.actionType,
    write.entityId,
  );

  return {
    id: (last?.id ?? 0) + 1,
    eventId: newId("aud"),
    actorId: write.actorId,
    actorRole: write.actorRole,
    actionType: write.actionType,
    entityType: write.entityType,
    entityId: write.entityId,
    location: write.location ?? null,
    occurredAt,
    payload: write.payload,
    prevHash,
    entryHash,
  };
}

export function verifyAuditChain(logs: AuditLog[]): {
  ok: boolean;
  brokenAt: number | null;
} {
  let prev: string | null = null;
  for (const row of logs) {
    const expected = hashEntry(
      prev,
      row.payload,
      row.occurredAt,
      row.actionType,
      row.entityId,
    );
    if (row.prevHash !== prev || row.entryHash !== expected) {
      return { ok: false, brokenAt: row.id };
    }
    prev = row.entryHash;
  }
  return { ok: true, brokenAt: null };
}
