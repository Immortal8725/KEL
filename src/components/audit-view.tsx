"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { actionLabel, formatWhen, roleLabel } from "@/lib/format";
import { usePlatform } from "@/lib/use-platform";

export function AuditView() {
  const { snapshot, chain } = usePlatform();

  if (!snapshot) {
    return <div className="text-muted-foreground p-8 text-sm">Loading ledger…</div>;
  }

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col px-4 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-primary uppercase">
            Who did what
          </div>
          <h1 className="font-heading text-2xl font-semibold">Immutable audit log</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Every flag, tip, assignment, photo, fine, and sign-off is appended
            to a SHA-256 hash chain. The application cannot update or delete a
            row — the prototype store only ever pushes.
          </p>
        </div>
        <Badge variant={chain?.ok ? "secondary" : "destructive"}>
          {chain?.ok ? "Chain intact" : `Broken at #${chain?.brokenAt}`}
        </Badge>
      </div>

      <ScrollArea className="min-h-0 flex-1 rounded-xl border border-border">
        <ol className="divide-y divide-border">
          {snapshot.audit.map((row) => (
            <li key={row.eventId} className="grid gap-2 px-4 py-3 md:grid-cols-[7rem_1fr_10rem]">
              <div className="tabular text-muted-foreground text-xs">
                {formatWhen(row.occurredAt)}
                <div className="font-mono text-[10px]">#{row.id}</div>
              </div>
              <div>
                <div className="text-sm font-medium capitalize">
                  {actionLabel(row.actionType)}
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  {roleLabel(row.actorRole)} · {row.entityType} · {row.entityId}
                </div>
                <pre className="bg-muted/40 mt-2 overflow-x-auto rounded-md p-2 font-mono text-[10px] leading-relaxed">
                  {JSON.stringify(row.payload, null, 2)}
                </pre>
              </div>
              <div className="font-mono text-[10px] break-all">
                <div className="text-muted-foreground">prev</div>
                {row.prevHash ? row.prevHash.slice(0, 16) : "GENESIS"}
                <div className="text-muted-foreground mt-2">hash</div>
                <span className="text-primary">{row.entryHash.slice(0, 20)}</span>
              </div>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </div>
  );
}
