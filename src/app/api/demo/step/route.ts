import { fail, json } from "@/lib/http";
import { runDemoStep } from "@/lib/demo";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { step?: string };
  if (!body.step) return fail("step is required.");
  const result = runDemoStep(body.step);
  return json(result, result.ok ? 200 : 400);
}
