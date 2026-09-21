"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { evidenceSvg } from "@/lib/evidence";
import { formatZar } from "@/lib/format";
import { postJson, usePlatform } from "@/lib/use-platform";
import { useSession } from "@/lib/use-session";
import { enqueue, flushOutbox, pendingCount } from "@/lib/offline";
import type { RevenueInvestigation } from "@/lib/types";

export function InspectorApp() {
  const { persona } = useSession();
  const { snapshot } = usePlatform();
  const [online, setOnline] = useState(true);
  const [queued, setQueued] = useState(0);
  const [sealBroken, setSealBroken] = useState(true);
  const [bypass, setBypass] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    pendingCount().then(setQueued);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (!online) return;
    flushOutbox((payload) => postJson("/api/field/action", payload)).then(() =>
      pendingCount().then(setQueued),
    );
  }, [online, snapshot]);

  const crew = snapshot?.crews.find((c) => c.id === persona?.crewId);
  const mine = snapshot?.investigations.find(
    (i) =>
      i.assignedCrewId === persona?.crewId &&
      i.status !== "closed_recovered" &&
      i.status !== "closed_no_finding",
  );
  const queue = useMemo(
    () =>
      (snapshot?.investigations ?? []).filter(
        (i) => i.status === "flagged" || i.status === "assigned",
      ),
    [snapshot],
  );
  const active =
    mine ??
    snapshot?.investigations.find((i) => i.id === selectedId) ??
    queue[0];

  async function act(payload: Record<string, unknown>) {
    const body = { ...payload, actorId: persona?.id };
    if (!online) {
      await enqueue(body);
      setQueued(await pendingCount());
      setStatus("Queued on-device until radio returns.");
      return;
    }
    await postJson("/api/field/action", body);
    setStatus("Hashed into the audit chain with GPS timestamp.");
  }

  return (
    <div className="mx-auto min-h-full max-w-md px-4 py-6">
      <div className="text-[10px] tracking-[0.2em] text-gold uppercase">
        Revenue protection · audit kit
      </div>
      <div className="flex items-start justify-between gap-2">
        <h1 className="font-heading text-xl font-semibold">Izinyoka audits</h1>
        <Badge variant={online ? "secondary" : "destructive"}>
          {online ? "Online" : "Offline"}
          {queued ? ` · ${queued}` : ""}
        </Badge>
      </div>
      <p className="text-muted-foreground mt-1 text-xs">
        {crew ? `${crew.callsign} · ${crew.status.replaceAll("_", " ")}` : "No unit"}{" "}
        · Zero-consumption flags and anonymous tips.
      </p>

      <div className="mt-4 space-y-2">
        {queue.map((inv) => (
          <button
            key={inv.id}
            type="button"
            onClick={() => setSelectedId(inv.id)}
            className={`w-full rounded-xl border p-3 text-left ${
              active?.id === inv.id ? "border-gold/60 bg-gold/10" : "border-border bg-card"
            }`}
          >
            <div className="flex justify-between gap-2">
              <span className="font-mono text-[11px]">{inv.reference}</span>
              <span className="text-gold text-xs">risk {inv.anomalyRiskScore}</span>
            </div>
            <div className="text-sm font-medium">{inv.suburb}</div>
            <div className="text-muted-foreground text-[11px]">
              {inv.type.replaceAll("_", " ")} · {inv.status.replaceAll("_", " ")}
              {inv.daysZeroConsumption ? ` · ${inv.daysZeroConsumption}d silent` : ""}
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <AuditCard
          inv={active}
          claimed={active.assignedCrewId === persona?.crewId}
          sealBroken={sealBroken}
          bypass={bypass}
          onSeal={setSealBroken}
          onBypass={setBypass}
          onClaim={() =>
            postJson("/api/dispatch", {
              kind: "investigation",
              targetId: active.id,
              crewId: persona?.crewId,
            })
          }
          onOnSite={() =>
            act({ action: "onsite", kind: "investigation", targetId: active.id })
          }
          onEvidence={() =>
            act({
              action: "evidence",
              kind: "investigation",
              targetId: active.id,
              caption: sealBroken
                ? "Broken meter seal + bypass jumper"
                : "Seal intact — no tamper visible",
              dataUri: evidenceSvg(
                bypass ? "Bypass confirmed" : "Meter kiosk",
                `${active.address} · GPS ${active.location.lat.toFixed(5)}, ${active.location.lon.toFixed(5)}`,
              ),
            })
          }
          onFine={() =>
            act({ action: "fine", kind: "investigation", targetId: active.id })
          }
        />
      ) : (
        <p className="text-muted-foreground mt-4 text-xs">
          No investigation on the queue. Ask dispatch to run the anomaly scan.
        </p>
      )}
      {status ? <p className="text-gold mt-4 text-xs">{status}</p> : null}
    </div>
  );
}

function AuditCard({
  inv,
  claimed,
  sealBroken,
  bypass,
  onSeal,
  onBypass,
  onClaim,
  onOnSite,
  onEvidence,
  onFine,
}: {
  inv: RevenueInvestigation;
  claimed: boolean;
  sealBroken: boolean;
  bypass: boolean;
  onSeal: (v: boolean) => void;
  onBypass: (v: boolean) => void;
  onClaim: () => void;
  onOnSite: () => void;
  onEvidence: () => void;
  onFine: () => void;
}) {
  const total = inv.fineAmountZar + inv.backbillZar + inv.penaltyZar;
  return (
    <div className="mt-4 rounded-xl border border-gold/40 bg-card p-4">
      <div className="font-mono text-xs">{inv.reference}</div>
      <div className="mt-1 font-semibold">{inv.address}</div>
      <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{inv.notes}</p>
      <div className="text-muted-foreground mt-2 text-[11px]">
        GPS {inv.location.lat.toFixed(5)}, {inv.location.lon.toFixed(5)} · captured
        on device clock
      </div>
      {inv.evidence.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {inv.evidence.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.dataUri}
              alt={photo.caption}
              className="h-24 w-full rounded-md object-cover ring-1 ring-border"
            />
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-2 text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={sealBroken}
            onChange={(e) => onSeal(e.target.checked)}
          />
          Meter seal broken / missing
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={bypass}
            onChange={(e) => onBypass(e.target.checked)}
          />
          Incoming tails bypassed (Izinyoka)
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {!claimed ? (
          <Button onClick={onClaim}>Accept audit · En Route</Button>
        ) : (
          <Button onClick={onOnSite}>Arrive On Site</Button>
        )}
        <Button variant="outline" onClick={onEvidence}>
          Log GPS photo evidence
        </Button>
        <Button variant="secondary" onClick={onFine} disabled={!bypass && !sealBroken}>
          Issue tamper fine
          {total ? ` · ${formatZar(total)}` : " + back-bill"}
        </Button>
      </div>
    </div>
  );
}
