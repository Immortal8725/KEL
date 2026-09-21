import { fail, json } from "@/lib/http";
import { getStore } from "@/lib/store";
import type { IngestReportInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IngestReportInput;
    if (
      typeof body?.location?.lat !== "number" ||
      typeof body?.location?.lon !== "number" ||
      !body.address ||
      !body.classification ||
      !body.channel
    ) {
      return fail("Report requires location, address, classification, and channel.");
    }
    const result = getStore().ingest(body);
    return json({ ok: true, ...result });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Ingest failed", 500);
  }
}

export function GET() {
  const store = getStore();
  return json({ ok: true, reports: store.snapshot().reports });
}
