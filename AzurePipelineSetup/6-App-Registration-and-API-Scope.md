# 6 — App Registration & Expose an API

[← 5 Tenant](5-Entra-External-ID-Tenant.md) · [Index](README.md) · Next: [7 — Google](7-Google-Federation.md)

## Goal

Register the SPA so it can sign users in, and expose an API scope so the backend can validate
access tokens. **Do all of this *inside the External ID tenant*** ([5](5-Entra-External-ID-Tenant.md)).

## Register the SPA (portal: Entra ID → App registrations → New registration)

- **Name**: e.g. `<App> Web`.
- **Supported account types**: "Accounts in this organizational directory only" (the external tenant).
- **Redirect URI**: platform **Single-page application (SPA)**, value = your app **origin**:
  - `http://localhost:3000` (dev — HTTP allowed only for `localhost`)
  - `https://<APP_URL>` (prod)
- Register → copy **Application (client) ID** = `<SPA_CLIENT_ID>`.
- The SPA platform auto-enables **Authorization Code + PKCE** and **no client secret** (public client).

## Expose an API (so the backend has a scope/audience)

- App → **Manage → Expose an API → Add** Application ID URI → accept default `api://<SPA_CLIENT_ID>` → Save.
- **+ Add a scope**: name `access_as_user`, who can consent **Admins and users**, enabled.
- Resulting scope = `<API_SCOPE>` = `api://<SPA_CLIENT_ID>/access_as_user`.
- Consent display text is cosmetic; only the **scope name** and **App ID URI** matter functionally.

## Values produced here

| Value | Used by |
|---|---|
| `<SPA_CLIENT_ID>` | MSAL `clientId` ([8](8-Frontend-Auth-MSAL.md)); backend audience ([9](9-Backend-Auth-JWT.md)) |
| `<API_SCOPE>` | MSAL login + token requests ([8](8-Frontend-Auth-MSAL.md)) |
| `api://<SPA_CLIENT_ID>` | backend `Audience` ([9](9-Backend-Auth-JWT.md)) |

## Verify

- Overview shows the Application (client) ID and the tenant ID.
- Authentication blade lists your SPA redirect URIs (dev + prod).
- Expose an API shows the App ID URI and the `access_as_user` scope.

## Gotchas & learnings

- **One app registration, multiple redirect URIs** (dev + prod + later `/blank.html` if you use the
  popup flow). The **client ID is the same across environments**.
- Redirect URI must **exactly** match what MSAL sends (scheme, host, trailing slash). Mismatch →
  `AADSTS50011`.
- App registrations are **Microsoft Graph** objects, not ARM — scriptable via `az ad app` / the
  Microsoft Graph Bicep extension, but the portal is fine for a one-time setup.
- **None of these values are secrets** — they ship in the browser bundle. See [8](8-Frontend-Auth-MSAL.md).

## Deferred / revisit later

- Attach this app to a **user flow** with the social provider — [7](7-Google-Federation.md).
- Put `<API_SCOPE>` into the SPA build variables — [8](8-Frontend-Auth-MSAL.md) and [10](10-Azure-Pipelines.md).
