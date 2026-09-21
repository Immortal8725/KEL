import { getStore } from "@/lib/store";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export function GET() {
  const store = getStore();
  return json({
    ok: true,
    snapshot: store.snapshot(),
    roi: store.roi(),
    chain: store.chainStatus(),
    serverTime: new Date().toISOString(),
  });
}
