# GitHub bootstrap checklist

One-time GitHub setup for a product repo instantiated from this template.
Code-external, owner action. Authority: `140-repo-governance-standard.md`
section 1 / section 6 and `product_240_repo-template.md` section 2.8.

## Batch 1 (governance shell) - do these now

- [ ] Create the repo PRIVATE.
- [ ] Enable GitHub secret scanning + push protection (repo Settings).
- [ ] ORDER MATTERS (empty repo): first-push `main` and let CI run once so the
      required checks are produced, THEN apply the ruleset. Applying a restrictive
      ruleset before the first import blocks that import.
  - [ ] `git push -u origin main` (establishes `main`, triggers first CI run).
  - [ ] Confirm the five checks appear and go green: `quality-gate` / `build` /
        `test-coverage` / `audit` / `gitleaks`.
  - [ ] Apply the ruleset:
        `gh api repos/vxture/<repo>/rulesets --method POST --input docs/50-deployment/rebuild/main-ruleset.json`
  - [ ] Verify: `gh api repos/vxture/<repo>/rulesets` shows a branch ruleset whose
        required checks include the five contexts.
- [ ] If CI needs to resolve `@vxture/*` packages, provide read access via
      `NODE_AUTH_TOKEN` / the `@vxture` registry; otherwise skip (batch 1 has no
      published-package dependency to resolve).

Batch 1 does NOT need deploy Environments or `DEPLOY_*` secrets - those are
batch E.

## Batch E (deployment) - later, not now

- [ ] Create GitHub Environments: `beta` (no reviewer gate) and `production`
      (Required reviewers configured - a `v*.*.*` tag deploy pauses until
      approved).
- [ ] Record per-Environment secrets/vars: `DEPLOY_HOST` / `DEPLOY_USER` /
      `DEPLOY_PORT` / `DEPLOY_SSH_KEY` (+ optional `_PASSPHRASE`) /
      `DEPLOY_KNOWN_HOSTS` (required) / `DEPLOY_DIR` / `ENV_FILE_BASE64` /
      `<CODE>_DB_SVC_PASSWORD`.
- [ ] Collect `DEPLOY_KNOWN_HOSTS` from a trusted network:
      `ssh-keyscan -p <port> <host>`.
- [ ] Confirm org-level shared credentials (ACR / tailscale / npm token) are
      shared to this repo (configured once at the org, not duplicated).
- [ ] Before the first deploy, SSH the target host and verify the stack root,
      `.env`, and ACR login are in place.
