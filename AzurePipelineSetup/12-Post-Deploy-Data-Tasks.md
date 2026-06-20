# 12 — Post-Deploy Data Tasks

[← 11 Deploy & Verify](11-Deploy-and-Verify.md) · [Index](README.md)

## Goal

Handle one-off data work that can only happen after deploy: schema changes, and linking the new
identity to existing domain records.

## Schema changes without an ORM migration

- Author **idempotent** SQL ([4](4-SQL-Database.md)) and run on **every** environment.
- **Sequence**: apply to a database **before** the code that reads the new column reaches it. For
  prod, run in the portal query editor, **then** deploy the matching build.

## Identity relink (migrating users to the new auth)

When moving from another auth system, existing rows are keyed by the **old** user id. On first
sign-in, link the new identity:

- New stable key = the token's **object id** (`oid` / MSAL `localAccountId`).
- Match the existing record by **email**, then update its key column to the new id. Then proceed
  normally (create the record only if no email match).
- Trigger this in a `LOGIN_SUCCESS` handler or your auth context once an account is present
  ([8](8-Frontend-Auth-MSAL.md)). Make it **idempotent** (skip if already linked).

## Duplicate-record gotcha (real)

A DB copied between environments can carry **duplicate users for the same email** (one with data,
one without). A naive "match by email" may link the **empty** one, so the user signs in but sees no
data. Defenses:

- In the lookup, **prefer the record that actually owns data** (e.g. the user with a household/team
  membership) over an empty duplicate.
- If a wrong link already happened, fix with SQL (move the new key onto the data-owning row,
  neutralize/remove the duplicate):
  ```sql
  -- put the new identity key on the row that has the data
  UPDATE Users SET ExternalKey = '<OID>' WHERE Id = <DATA_OWNING_ID>;
  -- neutralize the empty duplicate so it can't match again
  UPDATE Users SET ExternalKey = 'legacy-duplicate' WHERE Id = <DUPLICATE_ID>;
  ```
- Run the same diagnostic `SELECT … WHERE Email = '<email>'` in prod after first sign-in to confirm
  the right row got linked.

## Verify

- The signed-in user sees their own data.
- No duplicate/empty records are linked to the live identity.

## Gotchas & learnings

- Prod is often a **copy** of a lower environment — assume its quirks (duplicates, stale rows) exist
  there too, and re-run your checks per environment.
- **Version-control *schema* scripts** (idempotent DDL) so they're reviewable and repeatable —
  these are not "deployed"; nothing in the pipeline runs them automatically, you apply them by hand
  per environment.
- **Be cautious committing seed/sample *data* or DB dumps**, especially in a public repo — they can
  leak real/PII data and bloat history. Keep data fixtures out of the repo (or in an ignored/private
  location); the schema (model + an idempotent script) is enough to reconstruct an empty DB.
