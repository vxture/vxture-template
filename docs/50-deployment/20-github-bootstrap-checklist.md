# GitHub bootstrap checklist

One-time GitHub setup for a product repo instantiated from this template.
Code-external, owner action. Authority: `140-repo-governance-standard.md`
section 1 / section 6 and `product_240_repo-template.md` section 2.8.

## Batch 1 (governance shell) - do these now

- [ ] Create the repo PUBLIC (dev-phase repos are public; 140 section 2). A
      public repo defaults to all-rights-reserved - ship no LICENSE file and no
      `license` field (public != open source); clean any stray open-source marker.
- [ ] Enable GitHub secret scanning + push protection (repo Settings) - free and
      fully available on a public repo, and the primary defense now that there is
      no private fallback.
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

## Batch E (deployment) - PROD ONLY on worker02

This template deploys **production only** (owner decision) on **worker02** (in
the tailnet, non-VPC -> GHCR primary + ACR fallback), stack root
`/srv/md0/<code>` (data array). The workflows (`deploy`/`build`/`rollback`/
`db-init` + the `tailnet-ssh-connect` action) are already in the repo.

- [x] `production` GitHub Environment created with a Required reviewer (the
      deploy job pauses until approved). No `beta` environment (prod only).
- [ ] Record the **production** Environment secrets (values owner-transported):
      - `DEPLOY_HOST` = worker02 tailnet name/IP, `DEPLOY_USER`, `DEPLOY_PORT`
      - `DEPLOY_SSH_KEY` (+ optional `DEPLOY_KEY_PASSPHRASE`)
      - `DEPLOY_KNOWN_HOSTS` (required; `ssh-keyscan -p <port> worker02` from a
        trusted network - fail-closed, no TOFU)
      - `DEPLOY_DIR` (optional; defaults to `/srv/md0/<code>/deploy`)
      - `ENV_FILE_BASE64` (base64 of the instantiated `.env` for
        `/srv/md0/<code>/etc/.env` bootstrap-if-missing)
- [ ] Org-level shared credentials are already available to the repo (verified):
      `NODE_AUTH_TOKEN`, `ALIYUN_ACR_USERNAME/PASSWORD`, `TAILSCALE_OAUTH_*`; org
      vars `ALIYUN_ACR_REGISTRY/NAMESPACE`, `VXTURE_NPM_REGISTRY`,
      `TAILSCALE_OAUTH_CLIENT_TAG`.
- [ ] Register infra allocation for `<code>` (product_240 section 2.7 gap
      #6.10): `APP_PUBLISH_PORT`, host=worker02, stack_root=`/srv/md0/<code>`,
      apex domain, ACR namespace.
- [ ] Before the first deploy, SSH worker02 and verify `/srv/md0/<code>` exists,
      `etc/.env` is in place (or let bootstrap create it), and the ACR/GHCR
      logins work.
- [ ] Release: `git tag vX.Y.Z && git push origin vX.Y.Z` -> approve the pending
      `production` deployment. DB structure changes go through `db-init.yml`
      (`confirm=yes` + `expected_sha`), never the deploy chain.
