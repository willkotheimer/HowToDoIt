# 8 — Frontend Auth (MSAL)

[← 7 Google](7-Google-Federation.md) · [Index](README.md) · Next: [9 — Backend Auth](9-Backend-Auth-JWT.md)

## Goal

Sign users in from the SPA with MSAL and attach an access token to API calls.

## Config (values from tasks 5–6)

| Build variable (e.g. `VITE_*`) | Value |
|---|---|
| `..._ENTRA_CLIENT_ID` | `<SPA_CLIENT_ID>` |
| `..._ENTRA_TENANT_ID` | `<TENANT_ID>` |
| `..._ENTRA_AUTHORITY` | `https://<TENANT_SUBDOMAIN>.ciamlogin.com/<TENANT_ID>` |
| `..._ENTRA_API_SCOPE` | `api://<SPA_CLIENT_ID>/access_as_user` |

- **Local**: put these in a gitignored env file (e.g. `.env.local`).
- **Prod**: set them as **build-time** variables in the pipeline ([10](10-Azure-Pipelines.md)) — for
  bundlers like Vite they must be present during `build` and are baked into the bundle.

### API base URL per environment (don't ship `localhost` to prod)

The same env mechanism solves the classic "prod build calls my local API" bug. Define the API base
URL per environment so the correct endpoint is baked into the build:

- **Local** (`.env` / `.env.local`): `VITE_API_BASE_URL=https://localhost:<localApiPort>/api`
- **Prod** (`.env.production` or a pipeline build var): `VITE_API_BASE_URL=https://<api-host>/api`
- Note: bundler prefix matters — Vite uses `VITE_`, CRA uses `REACT_APP_`.
- **Optional runtime fallback** (if you don't use env files): branch on the host —
  ```js
  const API_BASE = window.location.hostname === 'localhost'
    ? 'https://localhost:<localApiPort>'
    : 'https://<api-host>';
  ```
  Env-at-build is preferred; the runtime check is a quick alternative.

## MSAL essentials

- Create one `PublicClientApplication` (singleton, shared by the provider and the API layer).
- Set `knownAuthorities: ['<TENANT_SUBDOMAIN>.ciamlogin.com']` so the CIAM authority is trusted.
- Prefer the **redirect flow** (`loginRedirect`) over popup (see gotchas).
- **`loginRequest.scopes` must include `<API_SCOPE>`** (plus `openid profile email`).
- On each API call, `acquireTokenSilent({ scopes: [<API_SCOPE>] })` and send `Authorization: Bearer`.
- Read identity from the account: object id (`localAccountId`) as the stable user key; email may be in
  `idTokenClaims.email` **or** `preferred_username` (Google federation) — check both.

## Verify

- Sign-in completes and the account appears (`getAllAccounts()` non-empty).
- API requests carry `Authorization: Bearer …`; decode the token and confirm `aud`, `scp`, `iss`.

## Gotchas & learnings (these each cost a session)

- **`endpoints_resolution_error`**: the bare authority `https://<sub>.ciamlogin.com/` may not resolve
  OIDC metadata. Use the **tenant‑scoped** authority `https://<sub>.ciamlogin.com/<TENANT_ID>`.
- **Call `initialize()` before any other MSAL call** (e.g. `getAllAccounts()`); newer MSAL throws
  `uninitialized_public_client_application` otherwise. Pattern: `await msal.initialize()` then render.
- **Popup loaded the whole app and wouldn't close.** Either use a dedicated blank redirect page for
  popup, or just use **redirect flow** (simplest, reliable). With redirect, do provisioning/relink in
  a `LOGIN_SUCCESS` event handler or in your auth context once an account is present.
- **Writes 401 even though signed in** → the login didn't request the API scope, so silent token
  acquisition returns nothing and calls go out tokenless. Add `<API_SCOPE>` to the login request.
- **Env vars don't hot‑reload** — restart the dev server after changing them.
- **These values are not secrets.** They're in the shipped bundle; keep them plain. No client secret
  exists for a SPA.

## Deferred / revisit later

- First-login **identity provisioning/relink** (mapping the Entra object id to your DB user) — see
  [12-Post-Deploy-Data-Tasks](12-Post-Deploy-Data-Tasks.md).
