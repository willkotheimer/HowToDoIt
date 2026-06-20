# 3 — Infrastructure with Bicep

[← 2 Foundation](2-Azure-Foundation.md) · [Index](README.md) · Next: [4 — SQL](4-SQL-Database.md)

## Goal

Define and deploy resources (App Service, Storage account + container, app settings) declaratively
so deployments are repeatable.

## What Bicep is (quick orientation)

Bicep is a declarative DSL that compiles to ARM templates. You describe the desired resources;
the deployment makes Azure match. Files use `param`/`var`/`resource`/`output`. Deploy with:
```bash
az deployment group create -g <RESOURCE_GROUP> -f main.bicep -p key=value
# validate / preview:
az bicep build --file main.bicep
az deployment group what-if -g <RESOURCE_GROUP> -f main.bicep
```

## Typical resources to declare

- **Storage account + blob service + container** (public-read container if serving images directly).
  - Storage account names: **3–24 chars, lowercase alphanumeric, globally unique**. Compose with
    `uniqueString(resourceGroup().id)` and a short prefix (watch the 24‑char limit).
- **App Service plan + Web App** for the API.
- **App settings** injected into the Web App (connection strings, storage connection, auth config).
  - Use the double‑underscore convention for nested keys: `Section__Key` →
    `Configuration["Section:Key"]` in .NET.

## What to set locally vs in Azure

- **Local dev** uses emulators / dev values (e.g. storage `UseDevelopmentStorage=true` for Azurite),
  kept in local app settings / `.env.local` (gitignored).
- **Azure** values are produced by Bicep (e.g. build the storage connection string from
  `storageAccount.listKeys()`), so secrets aren't committed.

## Verify

- `az bicep build` is clean.
- After deploy, the Web App's **Configuration** blade shows the expected app settings.
- `output` values (hostnames, endpoints) are returned by the deployment.

## Gotchas & learnings

- The **provider for each resource type must be registered** first ([2](2-Azure-Foundation.md)).
- Deployment that injects app settings via Bicep will **co-exist** with settings the pipeline sets
  on deploy — the pipeline's `AzureWebApp` task typically merges only the keys it lists, leaving
  Bicep-set keys intact. Confirm both sets land.
- Some resources are **not** ARM/Bicep-native (notably Entra app registrations — those are Microsoft
  Graph). See [6](6-App-Registration-and-API-Scope.md). Plan to do those via portal/CLI/Graph.

## Deferred / revisit later

- Auth-related app settings (issuer/authority, audience) are finalized once the tenant + app
  registration exist ([5](5-Entra-External-ID-Tenant.md), [6](6-App-Registration-and-API-Scope.md));
  wire them into Bicep app settings then.
