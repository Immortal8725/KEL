"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { actorName, auditStory, entityKindLabel } from "@/lib/audit-copy";
import { formatWhen, roleLabel } from "@/lib/format";
import { usePlatform } from "@/lib/use-platform";
import type { AuditLog } from "@/lib/types";

type Filter = "all" | "outage" | "revenue" | "system";

export function AuditView() {
  const { snapshot, chain } = usePlatform();
  const [filter, setFilter] = useState<Filter>("all");
  const [openSeal, setOpenSeal] = useState<string | null>(null);

  const rows = useMemo(() => {
    const list = snapshot?.audit ?? [];
    if (filter === "all") return list;
    return list.filter((row) => auditStory(row).kind === filter);
  }, [snapshot, filter]);

  if (!snapshot) {
    return (
      <div className="text-muted-foreground p-8 text-sm">Loading the activity log…</div>
    );
  }

  if (snapshot.audit.length === 0) {
    return (
      <div className="text-muted-foreground p-8 text-sm">
        No activity yet. Reports, dispatch, and field sign-off will appear here.
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-4 py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-primary uppercase">
            Activity log
          </div>
          <h1 className="font-heading text-2xl font-semibold">Who did what</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            A plain-language diary of every report, dispatch, on-site log, restore
            confirm, fine, and QA score. Rows cannot be edited or deleted — each
            one is sealed to the previous row.
          </p>
        </div>
        <Badge variant={chain?.ok ? "secondary" : "destructive"}>
          {chain?.ok ? "Seals intact" : `Break at entry #${chain?.brokenAt}`}
        </Badge>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {(
          [
            ["all", "All activity"],
            ["outage", "Outages"],
            ["revenue", "Revenue"],
            ["system", "System"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={filter === id ? "default" : "outline"}
            onClick={() => setFilter(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      <ScrollArea className="min-h-0 flex-1 rounded-xl border border-border">
        {rows.length === 0 ? (
          <p className="text-muted-foreground p-4 text-sm">
            Nothing in this filter yet.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {rows.map((row) => (
              <AuditRow
                key={row.eventId}
                row={row}
                who={actorName(row, snapshot.users)}
                sealOpen={openSeal === row.eventId}
                onToggleSeal={() =>
                  setOpenSeal((id) => (id === row.eventId ? null : row.eventId))
                }
              />
            ))}
          </ol>
        )}
      </ScrollArea>
    </div>
  );
}

function AuditRow({
  row,
  who,
  sealOpen,
  onToggleSeal,
}: {
  row: AuditLog;
  who: string;
  sealOpen: boolean;
  onToggleSeal: () => void;
}) {
  const story = auditStory(row);
  return (
    <li className="px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{story.title}</div>
          <div className="text-muted-foreground mt-0.5 text-xs">
            {who} · {roleLabel(row.actorRole)} · {formatWhen(row.occurredAt)}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline">{entityKindLabel(story.kind)}</Badge>
          {story.ticket ? (
            <span className="font-mono text-[11px]">{story.ticket}</span>
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed">{story.detail}</p>
      <button
        type="button"
        onClick={onToggleSeal}
        className="text-muted-foreground mt-2 text-[11px] underline-offset-2 hover:underline"
      >
        {sealOpen ? "Hide seal" : "Show seal (cannot be edited)"}
      </button>
      {sealOpen ? (
        <div className="bg-muted/40 text-muted-foreground mt-2 rounded-md p-2 font-mono text-[10px] leading-relaxed break-all">
          <div>Entry #{row.id}</div>
          <div>Previous seal: {row.prevHash ? row.prevHash.slice(0, 24) : "first entry"}</div>
          <div>This seal: {row.entryHash.slice(0, 28)}</div>
        </div>
      ) : null}
    </li>
  );
}
