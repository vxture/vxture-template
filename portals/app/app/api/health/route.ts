import { healthPayload } from "@product-code/shared/health";

// Liveness endpoint (verification channel; also the container healthcheck target).
// No auth, no DB - pure liveness. Dynamic so the time stamp is per-request.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(healthPayload(new Date().toISOString()));
}
