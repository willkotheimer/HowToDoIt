# 2 — Azure Foundation

[← 1 Prerequisites](1-Prerequisites-and-Tooling.md) · [Index](README.md) · Next: [3 — Bicep](3-Infrastructure-with-Bicep.md)

## Goal

Prepare the subscription and resource group so Bicep deployments succeed.

## Do in Azure (CLI or portal)

1. **Pick/confirm the subscription**
   ```bash
   az account set --subscription <SUBSCRIPTION_ID>
   az account show
   ```
2. **Create a resource group** (or reuse one)
   ```bash
   az group create -n <RESOURCE_GROUP> -l <REGION>
   ```
3. **Register resource providers** the deployment needs. New subscriptions are frequently *not*
   registered for providers you haven't used yet.
   ```bash
   az provider register --namespace Microsoft.Storage
   az provider register --namespace Microsoft.Web        # App Service
   az provider register --namespace Microsoft.Sql        # Azure SQL
   # check state:
   az provider show -n Microsoft.Storage --query registrationState -o tsv
   ```
   Registration is async ("Registering" → "Registered"), usually 1–2 minutes.

## Verify

- `az provider show -n <NS> --query registrationState` returns `Registered` for each provider.

## Gotchas & learnings

- **This was a real deploy failure.** Symptom in the pipeline log:
  ```
  MissingSubscriptionRegistration: The subscription is not registered to use namespace 'Microsoft.Storage'.
  ```
  The Bicep itself was correct — the provider just wasn't registered. Register it, then re‑run the
  pipeline. If a later run fails on a *different* namespace, register that one too (same fix).
- Providers are **per subscription**, registered once. Existing apps "work" because their providers
  were already registered by earlier deployments.
- Registration requires sufficient rights on the subscription (Contributor is typically enough to
  register providers; if not, an Owner/admin must do it once).

## Deferred / revisit later

- Identity is a **separate Entra External ID tenant/directory**, set up in
  [5-Entra-External-ID-Tenant](5-Entra-External-ID-Tenant.md) — not in this resource group.
