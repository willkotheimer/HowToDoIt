# 4 — SQL Database Setup

[← 3 Bicep](3-Infrastructure-with-Bicep.md) · [Index](README.md) · Next: [5 — Entra Tenant](5-Entra-External-ID-Tenant.md)

## Goal

A database the API can reach in every environment, with a clear story for applying schema changes.

## Do locally

- Run a local SQL Server / LocalDB; connection string e.g.
  `Server=localhost;Database=<DB>;Trusted_Connection=True;TrustServerCertificate=True;`
- Apply the schema (scripts or ORM migrations) so local matches prod.

## Do in Azure

- Provision **Azure SQL** (via Bicep or portal). Capture the **connection string** as a
  **pipeline secret** or in **Key Vault** — never commit it. See
  [10 — Secrets: pipeline variables vs Key Vault](10-Azure-Pipelines.md#secrets-pipeline-variables-vs-key-vault).
- Connect/manage via **Portal → SQL database → Query editor**, or SSMS/Azure Data Studio against the
  Azure server (add your client IP to the firewall).

## Schema change strategy

Two worlds — know which you're in:

- **With ORM migrations** (e.g. EF Core Migrations): generate a migration, apply on deploy.
- **Without migrations** (raw SQL scripts): you must run schema changes **manually on each
  environment**. Make scripts **idempotent** (guard with `IF NOT EXISTS`) and add sensible
  **defaults/backfills** so existing rows stay valid. Example:
  ```sql
  IF NOT EXISTS (SELECT 1 FROM sys.columns
                 WHERE Name = N'SortOrder' AND Object_ID = Object_ID(N'dbo.Images'))
  BEGIN
      ALTER TABLE dbo.Images ADD SortOrder INT NOT NULL CONSTRAINT DF_Images_SortOrder DEFAULT 0;
  END;
  ```

## Verify

- API starts and reads/writes locally.
- Connection string is set in the Web App config (via Bicep or pipeline), not in source.

## Gotchas & learnings

- **Order matters: schema before code.** If the new code references a column that doesn't exist yet,
  the ORM's `SELECT` fails ("Invalid column name") and breaks reads. Apply the SQL to a given
  database **before** deploying the build that expects it. For prod: run the script in the portal
  query editor, *then* merge/deploy.
- Copying a database between environments copies its quirks too (e.g. duplicate rows) — see
  [12-Post-Deploy-Data-Tasks](12-Post-Deploy-Data-Tasks.md).

## Deferred / revisit later

- One‑off data migrations (identity key relink, dedupe) are in
  [12-Post-Deploy-Data-Tasks](12-Post-Deploy-Data-Tasks.md).
