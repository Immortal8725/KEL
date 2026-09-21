import { json } from "@/lib/http";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  const store = getStore();
  return json({
    ok: true,
    roi: store.roi(),
    chain: store.chainStatus(),
  });
}
