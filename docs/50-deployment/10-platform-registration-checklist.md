# Platform-side registration checklist

Owner / platform-line actions taken on the PLATFORM side when instantiating a
product repo from this template. These are code-external and are performed in the
platform repo and platform consoles, not here. Authority:
`product_240_repo-template.md` section 2.8.

Placeholders below use the product code chosen at instantiation
(`scripts/init/instantiate.mjs <product_code>`): `<code>` lowercase, `<CODE>`
uppercase.

## Directory and plan

- [ ] Add the product row to the platform product directory: `code` / `layer`
      (L1/L2/L3) / `type`.
- [ ] Seed the plan structure (subscription tiers) for the product.

## OIDC (customer realm)

- [ ] Register the OIDC client pair: `<code>` (prod) and `<code>-beta` (beta) -
      double client is canonical (back-channel logout is a single-URI hard
      constraint). Realm = customer.
- [ ] Set each client's `redirect_uri`, `post_logout_redirect_uri`, and
      `back_channel_logout_uri`.
- [ ] Set allowed scopes to `openid profile email phone` (retired product-code and
      commercial scopes are not registered).

## Provisioning webhook (C3)

- [ ] Register the product in `product_webhooks` with its tailnet delivery
      address (`<CODE>_WEBHOOK_BASE_URL`).
- [ ] Add `<CODE>_PROVISION_WEBHOOK_SECRET` to the platform env; the owner
      hand-transports the secret value to the product repo's GitHub secrets.

## Secrets transport

- [ ] All secret values are owner-transported (never committed, never sent over
      insecure channels). Org-level shared credentials (ACR / tailscale / npm
      token) are configured once at the org and shared to this repo - not
      duplicated per repo.

## Note on batch scope

The OIDC and webhook rows above are needed once the platform-integration layer
(batch 2) and online testing (batch 3) come online. For the governance-shell
batch (batch 1) only the GitHub bootstrap checklist applies; platform
registration can wait until the integration layer lands.
