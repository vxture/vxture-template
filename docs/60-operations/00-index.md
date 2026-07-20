# 60-operations - Runbooks, audits, tech debt, incidents

Operational material for this repo: runbooks (`RUN-*`), audits, the tech-debt
register (`TD-NNN`), and incident notes.

## Tech-debt register (TD-NNN)

Append-only. Each entry is a known, deliberately-deferred debt with a stable ID
(never reused). Empty in the template skeleton.

| ID | Title | Opened | Status |
|----|-------|--------|--------|
| TD-001 | Wire the published `@vxture/shared` value-domain dependency + alignment guardrail | 2026-07-21 | open |

### TD-001 - `@vxture/shared` value-domain dependency

`product_220` section 3 / `product_240` section 2.4 make `@vxture/shared` the
single authority for the commercial value domains (tier five values,
subscription status six values, `METRIC_KINDS`). The template currently defines
these locally (`portals/app/app/entitlement/types.ts`) because `@vxture/shared`
installs from GitHub Packages and needs `NODE_AUTH_TOKEN`, which CI does not yet
have (deferred in the batch-1 bootstrap). **Resolution**: once CI is given
`NODE_AUTH_TOKEN` (bootstrap checklist), replace the local value-domain
constants with imports from `@vxture/shared` and add a
`check-catalog-domains`-style guardrail asserting the DDL/quota value domains
equal `@vxture/shared`. Until then the local copies are the working baseline and
carry an authority note.
