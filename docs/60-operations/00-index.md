# 60-operations - Runbooks, audits, tech debt, incidents

Operational material for this repo: runbooks (`RUN-*`), audits, the tech-debt
register (`TD-NNN`), and incident notes.

## Tech-debt register (TD-NNN)

Append-only. Each entry is a known, deliberately-deferred debt with a stable ID
(never reused). Empty in the template skeleton.

| ID | Title | Opened | Status |
|----|-------|--------|--------|
| TD-001 | Wire the published `@vxture/shared` value-domain dependency + alignment guardrail | 2026-07-21 | closed 2026-07-21 |

### TD-001 - `@vxture/shared` value-domain dependency

`product_220` section 3 / `product_240` section 2.4 make `@vxture/shared` the
single authority for the commercial value domains (tier five values,
subscription status six values, `METRIC_KINDS`). The template defined these
locally (`portals/app/app/entitlement/types.ts`) because `@vxture/shared`
installs from GitHub Packages and needs `NODE_AUTH_TOKEN`, which local dev did
not yet have (CI already had it as an org secret - see the credentials note
below).

**Closed 2026-07-21**: `gh auth refresh -s read:packages` unblocked local
install. `@vxture/shared@1.5.0` is now a real dependency of
`portals/app/package.json`; `entitlement/types.ts` imports `TIERS` /
`SUBSCRIPTION_STATUSES` / `Tier` / `SubscriptionStatus` directly from
`@vxture/shared` and re-exports them (local consumers - `capability.ts`,
`entitlement-matrix/page.tsx` - are unchanged, still import from `./types`).
Confirmed the published values are byte-for-byte identical to the prior local
copy (five tiers, six statuses, same order - order is load-bearing for
representative-status precedence).

The planned `check-catalog-domains`-style diff guardrail turned out to be
**unnecessary**: importing the value arrays directly (not copying their
literal contents) makes drift structurally impossible - there is nothing left
to diff against. A local DDL `CHECK` constraint on `tier`/`status` was also
considered; the template's DDL does not persist either column locally (C2
entitlement is platform-sourced, not locally stored), so there is no DDL side
to reconcile.

**Same migration also retired the template's health-identity duplicate**:
`@vxture/shared@1.5.0` now publishes `buildHealthIdentity()` /
`serviceIdentity()` matching `docs/10-standards/025-service-health-endpoint-
contract.md` exactly (same field names, same honest-fallback semantics via
`APP_VERSION`/`GIT_SHA`/`DEPLOY_STAGE`/`BUILD_TIME`). The template's own mirror
(`portals/packages/shared/src/health.ts` + `version.ts`) was deleted in favor
of importing directly - the exact anti-pattern 025 section 6 warns against
("各服务各写一份健康响应结构...一律用共享助手") would otherwise have re-appeared
the moment the platform published a real implementation of what the template
had already hand-rolled.

CI `build`/`test-coverage` jobs' `pnpm install --frozen-lockfile` steps now
pass `NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}` (previously unset -
harmless while no `@vxture/*` dependency existed, required now that a real one
does). CI already had `NODE_AUTH_TOKEN` as an org-level secret; the only new
piece this closure needed was refreshing local-dev `gh auth` with the
`read:packages` scope so the lockfile could be updated in the first place.
