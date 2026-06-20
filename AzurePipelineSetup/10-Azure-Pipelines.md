# 10 — Azure Pipelines (YAML CI/CD)

[← 9 Backend Auth](9-Backend-Auth-JWT.md) · [Index](README.md) · Next: [11 — Deploy & Verify](11-Deploy-and-Verify.md)

## Goal

CI on every PR; deploy (infra + API + frontend) only from the release branch.

## Pieces of the pipeline

- **Triggers**: run CI on PRs to `main` and on pushes to `main`.
- **Stages**:
  - **Backend CI** — build + test the API.
  - **Frontend CI** — install, build, unit/e2e tests.
  - **Provision infra** — `az deployment group create` with the Bicep ([3](3-Infrastructure-with-Bicep.md)).
  - **Deploy API** — `AzureWebApp`/`AzureRmWebAppDeployment` to the App Service.
  - **Deploy frontend** — to Static Web Apps (token) / storage static site.
- **Branch gating** so only the release branch deploys:
  ```yaml
  - stage: Deploy
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  ```
- **Service connection**: an Azure Resource Manager service connection (its service principal needs
  rights on the resource group/subscription — including to register providers if you rely on it).

## Variables & secrets

- **Pipeline variables** (Pipeline → Edit → Variables) or a **Variable group** (Pipelines → Library).
  A variable group needs a `variables: - group: <name>` reference in the YAML.
- **Secret** vs **plain**: mark genuine secrets (SQL connection string, SWA deploy token) as secret.
  **Public client / SPA values are plain** (client id, tenant id, authority, API scope) — they end up
  in the browser bundle anyway, and secret vars aren't auto-exposed to scripts.
- **Build-time env injection** (critical for bundlers): map variables into the build step's `env:` so
  the frontend bundle picks them up:
  ```yaml
  - script: npm run build
    workingDirectory: <frontend>
    env:
      VITE_ENTRA_CLIENT_ID: $(VITE_ENTRA_CLIENT_ID)
      VITE_ENTRA_TENANT_ID: $(VITE_ENTRA_TENANT_ID)
      VITE_ENTRA_AUTHORITY: $(VITE_ENTRA_AUTHORITY)
      VITE_ENTRA_API_SCOPE: $(VITE_ENTRA_API_SCOPE)
  ```

## Concrete CI recipe (frontend example, Linux agent)

A typical `FrontendCI` stage, in order — each step is a real task worth copying:

1. **Pin Node**: `NodeTool@0` with `versionSpec: 22.x`.
2. **Clean install**: `npm ci` with `workingDirectory: <frontend>` (declare the subfolder on every step).
3. **Unit tests**: `npm test` (in the frontend workspace).
4. **Publish unit results**: `PublishTestResults@2`, `condition: succeededOrFailed()` (so results publish
   even when a test fails), `testResultsFormat: JUnit`, `testResultsFiles: <frontend>/vitest-results/results.xml`.
5. **Build**: `npm run build`, with the **build-time `env:` block** (auth + API base URL — see below).
6. **E2E tooling**: `npx playwright install --with-deps chromium`.
7. **Serve the build in the background**: `node_modules/.bin/serve -s build -l 3000 &`, then
   `npx wait-on http://localhost:3000 --timeout 60000` before running tests.
8. **E2E tests**: `npm run test:e2e` with `env: { CI: true }`.
9. **Publish E2E results**: a second `PublishTestResults@2` → `<frontend>/playwright-results/results.xml`.
10. **Publish artifact**: `- publish: <frontend>/build` as a named artifact for the deploy stage.

The backend stage mirrors this (restore → build → test → publish results → publish artifact).

## Verify

- A PR runs CI but does **not** deploy.
- A merge to `main` runs CI → provision → deploy.
- The deployed bundle actually contains the auth config (sign-in works in prod, not just locally).

## Gotchas & learnings

- **Azure DevOps ≠ Azure Portal.** Pipelines/variables live in `dev.azure.com`; resources live in
  `portal.azure.com`. The YAML lives in the repo; the variable *values* live in DevOps (which is why
  they stay out of git).
- A **missing build-time variable** deploys fine but breaks prod at runtime (e.g. sign-in can't get an
  API token → writes 401). Confirm every `VITE_*`/build var exists in the pipeline before merging.
- App settings set by the deploy task typically **merge** with Bicep-set settings (only listed keys
  change) — verify both land in the Web App config.
- **YAML multi-line (`|`) block indentation will bite you.** For a `- script: |` step:
  - Every command line under the `|` must sit at the **exact same** indentation. One extra space
    breaks parsing.
  - Task properties (`displayName`, `workingDirectory`, `env`) must be **un-indented back to align
    with the `- script:` key** — if they line up with the inner command text, the parser treats them
    as literal shell commands, not task properties.
  ```yaml
  - script: |
      npx wait-on http://localhost:3000 --timeout 60000
      npm run test:e2e
    displayName: Wait for server, run E2E
    workingDirectory: <frontend>
    env:
      CI: true
  ```

### Secrets: pipeline variables vs Key Vault

- **Simplest (what's quickest to stand up):** mark genuine secrets as **secret pipeline variables**
  (e.g. SQL connection string, Static Web Apps deploy token).
- **More robust (recommended for production):** store secrets in **Azure Key Vault** and either link a
  **variable group to the Key Vault** in DevOps, or use **App Service Key Vault references** so the
  Web App reads secrets directly. Either way, secrets never live in source or in plain variables.

> **When to adopt Key Vault — sequencing matters.** It's reasonable to ship first with secret
> pipeline variables and add Key Vault *after* the core path (build → deploy → sign-in → write) is
> green. Introducing Key Vault during initial bring-up adds another moving part with its own access
> and permission failure modes — so a failure becomes hard to attribute when you're already fixing
> things across local, pipeline, and prod at once. Add it as a deliberate, isolated change once the
> baseline works.

## Deferred / revisit later

- First deploy failure modes and the verification checklist — [11](11-Deploy-and-Verify.md).
