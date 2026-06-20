# 9 — Backend Auth (JWT validation & authorization)

[← 8 Frontend Auth](8-Frontend-Auth-MSAL.md) · [Index](README.md) · Next: [10 — Pipelines](10-Azure-Pipelines.md)

## Goal

Validate the SPA's access tokens on the API and enforce authorization.

## Config (app settings, injected via Bicep/pipeline — not secrets)

| Setting | Value |
|---|---|
| `Entra:Authority` | `https://<TENANT_SUBDOMAIN>.ciamlogin.com/<TENANT_ID>/v2.0` |
| `Entra:Audience` | `api://<SPA_CLIENT_ID>` |

## JWT bearer setup (e.g. ASP.NET)

- `AddAuthentication().AddJwtBearer(...)` with `Authority = Entra:Authority` so the middleware
  discovers issuer + signing keys from OIDC metadata.
- Validate issuer, lifetime, and **audience** — but accept **both** `api://<SPA_CLIENT_ID>` **and**
  the bare client‑id GUID (Entra v2 may issue either as `aud`):
  ```csharp
  var aud = Configuration["Entra:Audience"];
  var valid = new List<string> { aud };
  if (aud.StartsWith("api://")) valid.Add(aud.Substring("api://".Length));
  options.TokenValidationParameters = new() {
      ValidateIssuer = true, ValidateLifetime = true,
      ValidateAudience = true, ValidAudiences = valid,
  };
  ```
- **Don't forget `app.UseAuthentication()`** before `app.UseAuthorization()` (easy to omit —
  without it, `[Authorize]` does nothing).

## CORS (let the frontend call the API)

The SPA is served from a different origin than the API, so the API must allow it via CORS — or every
browser call fails before auth even runs.

- Allow the specific frontend origins: `http://localhost:3000` (dev) and `https://<APP_URL>` (prod).
- If you send a bearer token, you need standard CORS (not credentialed cookies); still, list explicit
  origins rather than `*` for anything beyond pure public reads.
- Register CORS **before** auth/authorization in the middleware order, and make sure preflight
  `OPTIONS` requests are allowed (the write-auth filter below should treat `OPTIONS` as a safe method).
- This origin list is the same set as the SPA redirect URIs ([6](6-App-Registration-and-API-Scope.md)) —
  keep them in sync when the frontend URL changes.

> Note: if you use a different auth provider (e.g. Firebase), you must also **authorize the prod
> frontend domain** in that provider (Firebase → Authentication → Settings → Authorized domains) to
> avoid `auth/unauthorized-domain`. With Entra External ID the equivalent is the app registration's
> redirect URIs.

## Authorization strategy

- Decide what's locked down. A useful pattern: **require auth on writes (POST/PUT/PATCH/DELETE),
  leave GETs anonymous** (so public/demo browsing still works). Implement as a global authorization
  filter keyed on HTTP method (respecting `[AllowAnonymous]`), rather than annotating every action.

## Verify

- Anonymous GET works; an unauthenticated write returns **401**.
- An authenticated write with a valid bearer succeeds (watch the API log for issuer/audience reasons
  on rejection).

## Gotchas & learnings

- **Audience mismatch** is the classic 401-with-a-valid-token. Accept both audience forms (above).
- Issuer in the token uses the **tenant‑ID subdomain** even if your authority uses the name
  subdomain — relying on metadata discovery (set `Authority`, let it fetch) handles this.
- If a singleton service makes a network call in its **constructor** (e.g. ensuring a storage
  container exists), it can blow up unrelated requests when that dependency is down. Make such calls
  **lazy** (on first real use), not in the constructor.

## Deferred / revisit later

- Mapping the token's user (object id) to your domain user is data work — [12](12-Post-Deploy-Data-Tasks.md).
