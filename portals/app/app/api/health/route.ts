import { buildHealthIdentity } from "@product-code/shared/health";

// Liveness endpoint. 020: zero-dependency (no DB/Redis/upstream), the container
// healthcheck target, app bound to 0.0.0.0 (Dockerfile). 025: returns the full
// identity/provenance block. runtime="nodejs" so it reads the build-injected
// server env (APP_VERSION/GIT_SHA/DEPLOY_STAGE/BUILD_TIME); force-dynamic so
// `time` is per-request (proves real-time answer + clock).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return Response.json(buildHealthIdentity());
}
