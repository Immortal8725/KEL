import { json } from "@/lib/http";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export function GET() {
  const store = getStore();
  return json({
    ok: true,
    audit: store.snapshot().audit,
    chain: store.chainStatus(),
  });
}
