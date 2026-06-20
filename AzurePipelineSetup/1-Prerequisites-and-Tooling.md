# 1 — Prerequisites & Tooling

[← Index](README.md) · Next: [2 — Azure Foundation](2-Azure-Foundation.md)

## Goal

Have the accounts and local tools needed for every later task.

## Accounts you need

- **Azure subscription** (with rights to create resources and register providers).
- **Azure DevOps** organization + project (for pipelines) **or** GitHub (if using GitHub Actions / Azure Pipelines against GitHub).
- A **source repo** (Azure Repos or GitHub).
- For social sign-in: a **Google Cloud** account (see [7](7-Google-Federation.md)).

## Install locally

- **Azure CLI** (`az`) — sign in with `az login`; confirm with `az account show`.
- **Bicep** — `az bicep install` (or bundled with recent `az`).
- Language/runtime SDK for the API (e.g. **.NET SDK**) and **Node.js** for the SPA.
- **SQL tooling** — SSMS, Azure Data Studio, or the VS Code `mssql` extension.
- Local storage emulator if you use Blob storage (e.g. **Azurite**: `npm i -g azurite`).

## Verify

```bash
az account show          # correct subscription?
az bicep version
# language/runtime versions as appropriate
```

## Gotchas & learnings

- **Windows + PowerShell execution policy**: npm shims (`npm.ps1`) can be blocked with
  "running scripts is disabled". Fix per-user: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`,
  or use Git Bash (not subject to PowerShell policy), or call `npm.cmd`.
- Keep CLI authenticated to the **same subscription** you intend to deploy to (`az account set --subscription <SUBSCRIPTION_ID>`).

## Deferred / revisit later

- Pipeline service connection + variables are configured in [10-Azure-Pipelines](10-Azure-Pipelines.md).
