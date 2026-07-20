# 30-design - Architecture, ADRs, domain design, DB schema

Design documents for this repo: architecture, architecture decision records
(`decisions/`), domain design, and database schema docs.

Empty of domain documents in the template skeleton. Domain documents use the
strict org underscore family `{kind}_{domain}_{NNN}_{slug}` (kind in
data/design/ops), enabled once the product's domain code is registered in the
taxonomy domain-code table (`070-docs-taxonomy.md` section 5). The template plants
no domain docs and reserves no product domain schema names beyond the contract
schemas (`vx_provision` / `local_authz` / `local_usage`).

## Subdirectories

- `decisions/` - architecture decision records (`ADR-NNN`, append-only, stable IDs)
