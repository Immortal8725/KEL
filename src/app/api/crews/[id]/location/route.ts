import { fail, json } from "@/lib/http";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      lon: number;
      lat: number;
      status?: "available" | "en_route" | "on_site" | "off_duty";
    };
    getStore().updateCrewGps(id, body.lon, body.lat, body.status);
    return json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "GPS update failed", 500);
  }
}
