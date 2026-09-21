import { fail, json } from "@/lib/http";
import { getStore } from "@/lib/store";
import type { JobKind } from "@/lib/engines/dispatch";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      kind: JobKind;
      targetId: string;
      crewId?: string;
    };
    if (!body.kind || !body.targetId) {
      return fail("kind and targetId are required.");
    }
    const result = getStore().dispatch(body.kind, body.targetId, body.crewId, {
      auto: !body.crewId,
    });
    return json({ ok: true, ...result });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Dispatch failed", 500);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kind = (url.searchParams.get("kind") ?? "outage") as JobKind;
  const targetId = url.searchParams.get("targetId");
  if (!targetId) return fail("targetId is required.");
  return json({
    ok: true,
    recommendations: getStore().recommend(kind, targetId),
  });
}
