# Azure Deployment Playbook

A reusable, generalized guide for deploying a full‑stack app to Azure:

- **Frontend**: SPA (e.g. React/Vite) → Azure Static Web Apps
- **Backend**: .NET (or similar) API → Azure App Service
- **Database**: Azure SQL (or SQL Server)
- **Storage**: Azure Blob Storage for file/image uploads
- **Auth**: Microsoft Entra External ID (CIAM) with a social provider (e.g. Google)
- **IaC**: Bicep
- **CI/CD**: Azure Pipelines

This started life as a single app's migration and has been distilled into provider‑agnostic
steps. Replace the `<PLACEHOLDERS>` with your own values. Not every project needs every task
(skip storage if you have no uploads, skip Google if you only use email, etc.).

> This folder was assembled across multiple sessions (with a little help from other assistants).
> Keep it organized — add new task files in sequence and link them.

## How to use this

Work the numbered files in order. Each file is mostly **self‑contained** and states clearly:
what to do **locally**, what to do **in Azure/portal/CLI**, how to **verify**, and any
**gotchas**. When a step can only be finished after a later task, the file says so and a
later‑numbered task picks it up.

## Task order

1. [Prerequisites & Tooling](1-Prerequisites-and-Tooling.md)
2. [Azure Foundation (subscription, resource group, resource providers)](2-Azure-Foundation.md)
3. [Infrastructure with Bicep](3-Infrastructure-with-Bicep.md)
4. [SQL Database Setup](4-SQL-Database.md)
5. [Entra External ID Tenant](5-Entra-External-ID-Tenant.md)
6. [App Registration & Expose an API](6-App-Registration-and-API-Scope.md)
7. [Google Federation (social sign-in)](7-Google-Federation.md)
8. [Frontend Auth (MSAL)](8-Frontend-Auth-MSAL.md)
9. [Backend Auth (JWT validation & authorization)](9-Backend-Auth-JWT.md)
10. [Azure Pipelines (YAML CI/CD)](10-Azure-Pipelines.md)
11. [Deploy & Verify](11-Deploy-and-Verify.md)
12. [Post-Deploy Data Tasks (schema changes, identity relink)](12-Post-Deploy-Data-Tasks.md)

## Hard-won principles (read first)

These are the things that actually cost time. Details live in the linked tasks.

- **Register resource providers before deploying.** A fresh subscription often isn't registered
  for `Microsoft.Storage` (and friends), and the Bicep deploy fails with
  `MissingSubscriptionRegistration`. Fix: `az provider register --namespace Microsoft.Storage`.
  See [2-Azure-Foundation](2-Azure-Foundation.md).
- **Schema changes must reach the database *before* the code that needs them.** If you have no
  ORM migrations, apply idempotent SQL to **every** environment (local + prod) before/with the
  matching deploy, or reads break. See [4-SQL-Database](4-SQL-Database.md) and
  [12-Post-Deploy-Data-Tasks](12-Post-Deploy-Data-Tasks.md).
- **SPA auth values are not secrets.** Client ID, tenant ID, and authority get compiled into the
  browser bundle. Keep them as plain build variables; the only real secret is a *confidential
  client* secret (which a SPA does not have). See [8-Frontend-Auth-MSAL](8-Frontend-Auth-MSAL.md).
- **Request the API scope at login.** If the SPA only requests `openid/profile/email`, silent
  token acquisition for your API fails and every write 401s. See [8](8-Frontend-Auth-MSAL.md).
- **Accept multiple audiences on the API.** Entra v2 tokens may carry `aud` as `api://<client-id>`
  *or* the bare client‑id GUID. Validate both. See [9-Backend-Auth-JWT](9-Backend-Auth-JWT.md).
- **Deploy stages should be branch‑gated.** Run CI on PRs, but only deploy from `main` (or your
  release branch). See [10-Azure-Pipelines](10-Azure-Pipelines.md).
- **The Entra External ID tenant is a separate directory.** Create it in the portal; do app
  registrations *inside that tenant*, not your default workforce directory. See
  [5](5-Entra-External-ID-Tenant.md).
- **Minimize concurrent unknowns; add infrastructure incrementally.** During initial bring-up you're
  already debugging across local + pipeline + prod — every *new* moving part (Key Vault, a CDN, an
  extra service) is another suspect when something breaks, with its own failure modes. Get the core
  path green first, then add nice-to-haves as deliberate, isolated changes so failures stay
  attributable. (This is why we shipped with secret pipeline variables and deferred Key Vault.)

## Conventions / placeholders

| Placeholder | Meaning |
|---|---|
| `<SUBSCRIPTION_ID>` | Azure subscription GUID |
| `<RESOURCE_GROUP>` | Resource group name |
| `<TENANT_ID>` | Entra External ID tenant (directory) GUID |
| `<TENANT_SUBDOMAIN>` | e.g. `contoso` in `contoso.onmicrosoft.com` / `contoso.ciamlogin.com` |
| `<SPA_CLIENT_ID>` | Application (client) ID of the SPA app registration |
| `<API_SCOPE>` | `api://<SPA_CLIENT_ID>/access_as_user` |
| `<APP_URL>` | Deployed frontend URL |
