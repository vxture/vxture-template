import { BRAND } from "./brand";
import { readProvenance } from "./version";

// Liveness identity block (025 section 3). Zero-dependency (020): proves the
// process is listening AND reports who / which build / what stage - honestly
// (dev/unknown when un-injected, never fabricated). THE single source of the
// health response shape; services must not hand-roll their own (drift is the
// failure mode 025 exists to kill). Mirrors the platform @vxture/shared helper.
export interface HealthIdentity {
  status: "ok";
  service: string;
  product?: string;
  version: string;
  gitSha: string;
  stage: string;
  buildTime: string;
  time: string;
}

export function buildHealthIdentity(
  opts: { service?: string; product?: string; now?: string } = {},
): HealthIdentity {
  const p = readProvenance();
  return {
    status: "ok",
    service: opts.service ?? `${BRAND.productCode}-app`,
    product: opts.product ?? BRAND.productCode,
    version: p.version,
    gitSha: p.gitSha,
    stage: p.stage,
    buildTime: p.buildTime,
    time: opts.now ?? new Date().toISOString(),
  };
}
