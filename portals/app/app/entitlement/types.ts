// C2 entitlement envelope v3 and the gating predicates (product_220 section 3,
// product_200 section 3). Read-only consumption: the product renders commercial
// facts and never re-derives commercial decisions.
//
// VALUE-DOMAIN AUTHORITY = @vxture/shared (product_220 section 3). These local
// constants are a temporary baseline until the published dependency is wired
// (see docs/60-operations TD-001); keep them equal to @vxture/shared.

export const TIERS = ["free", "starter", "pro", "business", "enterprise"] as const;
export type Tier = (typeof TIERS)[number];

// Six real subscription states. `overdue` = dunning grace (entitlement retained).
// Representative-status precedence (platform-side): active > trialing > overdue >
// suspended > expired > cancelled. "Never subscribed" is null, NOT a status value.
export const SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "overdue",
  "suspended",
  "expired",
  "cancelled",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export interface QuotaPool {
  metric: string; // must hit a platform metric registry key; product never defines
  limit: number;
  remaining: number;
  priority: number;
}

// The C2 envelope. Consumers MUST tolerate unknown added fields and unknown
// `status` enum values (degrade: hide / render conservatively).
export interface Entitlement {
  workspace_id: string;
  product: string;
  status: SubscriptionStatus | null; // null = never had a direct-purchase subscription
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  data_retention_until: string | null;
  tier: Tier | null; // pure five values; null = no active direct purchase
  bundled: boolean; // an independent axis, coexists with tier
  limits: Record<string, number>; // max-type sales numbers; product counts locally
  quota_pools: QuotaPool[];
}

export const EMPTY_ENTITLEMENT: Omit<Entitlement, "workspace_id" | "product"> = {
  status: null,
  trial_ends_at: null,
  current_period_end: null,
  cancel_at_period_end: false,
  data_retention_until: null,
  tier: null,
  bundled: false,
  limits: {},
  quota_pools: [],
};

// --- Gating (product_220 section 3; one line, never widened locally) ---

/** Product UI gate: may this workspace use the product surface at all? */
export function hasProductAccess(e: Entitlement): boolean {
  return e.tier != null;
}

/** Backend / data-plane gate: data access includes bundled coverage. */
export function hasDataAccess(e: Entitlement): boolean {
  return e.tier != null || e.bundled;
}

// --- CTA branch by status (product_240 section 2.4 #9) ---
// null -> subscribe; overdue -> pay (fix payment); expired/cancelled/suspended
// -> renew; active/trialing -> no CTA (in good standing).
export type Cta = "subscribe" | "pay" | "renew" | "none";

export function ctaFor(e: Entitlement): Cta {
  if (e.tier != null && (e.status === "active" || e.status === "trialing")) return "none";
  if (e.status == null) return "subscribe";
  if (e.status === "overdue") return "pay";
  if (e.status === "expired" || e.status === "cancelled" || e.status === "suspended") {
    return "renew";
  }
  // Unknown/other status with no access -> conservative subscribe prompt.
  return e.tier != null ? "none" : "subscribe";
}
