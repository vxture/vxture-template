// Build provenance (025 section 4). All four values are injected at BUILD time
// (Dockerfile ARG -> ENV, fed by CI from the git tag / sha / build date); read
// here at RUNTIME, server-side only - these are NOT NEXT_PUBLIC_* and never enter
// the client bundle. Missing injection falls back HONESTLY to dev/unknown; we
// never fabricate a version (no "1.0.0", no gitSha "dev", no stage "local").
export interface Provenance {
  version: string; // human release number = deploy git tag (e.g. v0.1.2); non-tag -> "dev"
  gitSha: string; // build commit SHA, BARE (no "sha-" image-tag prefix); missing -> "unknown"
  stage: string; // runtime env: production | beta | dev; missing -> "dev"
  buildTime: string; // image build ISO timestamp; missing -> "unknown"
}

export function readProvenance(env: Record<string, string | undefined> = process.env): Provenance {
  return {
    version: env.APP_VERSION || "dev",
    gitSha: env.GIT_SHA || "unknown",
    stage: env.DEPLOY_STAGE || "dev",
    buildTime: env.BUILD_TIME || "unknown",
  };
}

// Module-load snapshot for display consumers (page.tsx, status.ts). The liveness
// helper (health.ts) re-reads per call so build env is picked up at request time.
export const VERSION = readProvenance();

export type Version = typeof VERSION;
