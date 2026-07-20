import { BRAND } from "./brand";
import { VERSION } from "./version";

// Liveness payload shared by the /api/health route (verification channel).
export interface HealthPayload {
  status: "ok";
  product: string;
  gitSha: string;
  time: string;
}

export function healthPayload(now: string): HealthPayload {
  return {
    status: "ok",
    product: BRAND.productCode,
    gitSha: VERSION.gitSha,
    time: now,
  };
}
