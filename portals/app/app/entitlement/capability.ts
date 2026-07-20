import type { Entitlement, Tier } from "./types";
import { TIERS, hasProductAccess } from "./types";

// Capability matrix MECHANISM (product_220 section 3). tier -> feature keys is
// PRODUCT knowledge - the platform never configures feature keys. The template
// ships the versioned mechanism plus an EMPTY matrix; the concrete FEATURE_KEYS
// and their tier assignment are a blank zone (product_240 section 2.9) that each
// product fills in its own repo. No domain feature keys ship in the template.

export type FeatureKey = string;

// Cumulative per tier (a higher tier includes everything lower tiers have).
// Empty in the template - product replaces with its real features.
export const CAPABILITY_MATRIX: Record<Tier, FeatureKey[]> = {
  free: [],
  starter: [],
  pro: [],
  business: [],
  enterprise: [],
};

export function canUseFeature(e: Entitlement, key: FeatureKey): boolean {
  if (!hasProductAccess(e) || e.tier == null) return false;
  return CAPABILITY_MATRIX[e.tier].includes(key);
}

/** Lowest tier that unlocks a feature, or null if no tier grants it. */
export function minTierFor(key: FeatureKey): Tier | null {
  for (const tier of TIERS) {
    if (CAPABILITY_MATRIX[tier].includes(key)) return tier;
  }
  return null;
}
