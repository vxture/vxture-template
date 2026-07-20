# 70-workplan - Build plan and batch tracker

This repo is built incrementally from `vxture-template`. Each batch is one PR with
machine-checked acceptance (self-rectify runbook batches A-G). Authority for the
plan: platform repo `docs/30-design/product_240_repo-template.md` section 7.

## Batch 1 (governance shell) - runbook batches A-D

| Batch | Scope | Acceptance | State |
|-------|-------|-----------|-------|
| A | Root files + branch-protection ruleset (not yet applied) | first-push succeeds; `git diff --check` clean | done (local) |
| B | Four-layer secret hygiene (gitleaks) | `gitleaks detect` full history 0 hits; CI `gitleaks` green | done (local) |
| C | SCA hard gate (osv-scanner) | `osv-scanner scan -L pnpm-lock.yaml --config .osv-scanner.toml` -> No issues found; CI `audit` green | done (local; full scan needs the batch-D lockfile) |
| D | Docs skeleton + CI aggregate + package.json + instantiate script + checklists | `check-docs-numbering.mjs --strict` exit 0; `pnpm type-check:all` passes; CI five jobs green | in progress |
| A (finish) | Apply `main-ruleset.json` | `gh api repos/vxture/<repo>/rulesets` has a branch ruleset with the five required contexts | pending first push |

Batch 1 done = runbook batches A-D machine-checks all green + ruleset applied.

## Later batches

| Batch | Scope |
|-------|-------|
| 2 | Platform integration layer (OIDC RP, C2/C3 channels) + business-face DB baseline + offline Mock verification |
| 3 | Online integration testing against real platform endpoints; agent-profile increment per its three pre-decisions |
| 4 | First real product instantiation, full end-to-end |

Not in batch 1: application source, the deploy pipeline (batch E), the
business-face database (batch F), and the three-channel platform modules.
