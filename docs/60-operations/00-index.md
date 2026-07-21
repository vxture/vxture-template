# 60-operations - Runbooks, audits, tech debt, incidents

Operational material for this repo: runbooks (`RUN-*`), audits, the tech-debt
register (`TD-NNN`), and incident notes.

## Tech-debt register (TD-NNN)

Append-only. Each entry is a known, deliberately-deferred debt with a stable ID
(never reused). Empty in the template skeleton.

| ID | Title | Opened | Status |
|----|-------|--------|--------|
| TD-001 | Wire the published `@vxture/shared` value-domain dependency + alignment guardrail | 2026-07-21 | closed 2026-07-21 |
| TD-002 | Vendored health-identity implementation deviated from 025's shared-helper clause (undeclared) | 2026-07-21 | closed 2026-07-21 |

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

### TD-002 - vendored health-identity implementation (undeclared deviation)

**Retroactive registration**, filed per the platform's 2026-07-21 deviation
discipline (`140-repo-governance-standard.md` execution-model section):
standard clauses that cannot yet be met because an upstream dependency is not
ready must be (1) annotated at the implementation site, (2) registered here by
name (clause / reason / recovery condition), and (3) reported to the platform
line - silent deviation fails self-rectify acceptance.

- **Clause deviated from**: `docs/10-standards/025-service-health-endpoint-
  contract.md` section 5/6 - "single shared helper, no service hand-rolls its
  own response shape."
- **Reason**: earlier the same day, the template built its own
  `buildHealthIdentity()` in `portals/packages/shared/src/health.ts` (mirroring
  025's documented shape) because `@vxture/shared` did not yet publish a real
  implementation - the dependency did not exist to import. This was a
  reasonable stopgap but was never declared as a deviation (no TD entry, no
  report to the platform line) - exactly the undeclared-deviation failure mode
  the platform's new discipline exists to close. The platform caught it via an
  unrelated arda cross-check and issued
  `docs/20-specs/220-vxtpl/10-vxtpl_301_shared-150-health-import-2607212159.md`
  (`vxtpl_301`).
- **Recovery condition**: `@vxture/shared` publishes `buildHealthIdentity()` /
  `serviceIdentity()`.
- **Closed 2026-07-21**: condition met at `@vxture/shared@1.5.0` (same release
  that resolved TD-001). The vendored `health.ts`/`version.ts` were deleted in
  the same change (see TD-001 above); the liveness route and status/page
  consumers now import `@vxture/shared` directly. No live implementation site
  remains to annotate (the vendor file no longer exists) - this entry plus the
  reply liaison letter (`docs/80-liaison/`) are the closure record `vxtpl_301`
  §3.4 asked for.
