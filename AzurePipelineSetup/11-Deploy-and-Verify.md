# 11 — Deploy & Verify

[← 10 Pipelines](10-Azure-Pipelines.md) · [Index](README.md) · Next: [12 — Post-Deploy Data Tasks](12-Post-Deploy-Data-Tasks.md)

## Goal

Ship to prod and confirm the whole chain works: sign-in → token → authorized writes → storage/DB.

## Pre-merge checklist

- [ ] Resource providers registered ([2](2-Azure-Foundation.md)).
- [ ] Required schema changes already applied to the **prod** DB ([4](4-SQL-Database.md)).
- [ ] All build-time variables present in the pipeline ([10](10-Azure-Pipelines.md)) — especially the API scope.
- [ ] Prod redirect URI (`https://<APP_URL>`) registered on the SPA app ([6](6-App-Registration-and-API-Scope.md)).
- [ ] Auth app settings (`Entra:Authority`, `Entra:Audience`) wired into the API ([3](3-Infrastructure-with-Bicep.md)/[9](9-Backend-Auth-JWT.md)).
- [ ] API **CORS** allows the prod frontend origin (`https://<APP_URL>`) ([9](9-Backend-Auth-JWT.md)).
- [ ] Frontend `VITE_API_BASE_URL` (or equivalent) points at the **prod** API, not localhost ([8](8-Frontend-Auth-MSAL.md)).

## Deploy

- Merge to `main` (or your release branch) → pipeline provisions infra and deploys API + frontend.

## Verify in prod

1. Load the app; **sign in** with the social provider → land authenticated.
2. Confirm an authenticated **write** (upload/save) succeeds (proves token + audience + authorization).
3. Confirm anonymous reads still work if that's your design.
4. Check the API logs are clean (no 401/issuer/audience errors).

## Common first-deploy failures (and fixes)

| Symptom | Cause | Fix |
|---|---|---|
| `MissingSubscriptionRegistration: ... 'Microsoft.Storage'` | provider not registered | `az provider register --namespace <NS>` ([2](2-Azure-Foundation.md)), re-run |
| `AADSTS50011` redirect mismatch | prod redirect URI not registered / wrong string | add exact origin to SPA app reg ([6](6-App-Registration-and-API-Scope.md)) |
| Signed in but writes **401** | API scope missing from build vars, or audience mismatch | add `<API_SCOPE>` build var ([10](10-Azure-Pipelines.md)); accept both audiences ([9](9-Backend-Auth-JWT.md)) |
| Image/file reads 500 | new schema column not in prod DB | apply the SQL to prod first ([4](4-SQL-Database.md)) |
| Browser console CORS error; API calls blocked | API doesn't allow the prod frontend origin | add `https://<APP_URL>` to the API CORS origins ([9](9-Backend-Auth-JWT.md)) |
| User signs in but sees no data | identity not linked to a domain user | relink ([12](12-Post-Deploy-Data-Tasks.md)) |

## Gotchas & learnings

- Re-running just the **failed stage** is faster than a full pipeline re-run.
- Performance tuning (cold starts, image sizes, CDN) is a deliberate later iteration — don't block the
  first working deploy on it.

## Deferred / revisit later

- Verifying/repairing identity data in prod — [12](12-Post-Deploy-Data-Tasks.md).
