# 7 — Google Federation (social sign-in)

[← 6 App Registration](6-App-Registration-and-API-Scope.md) · [Index](README.md) · Next: [8 — Frontend Auth](8-Frontend-Auth-MSAL.md)

## Goal

Let users sign in with Google through your External ID tenant, and make it appear on a sign-in page.

## Part A — Create the Google OAuth client (Google Cloud Console)

1. `console.cloud.google.com` → **create a new project** (and **select it** — the console often drops
   you into an old default project; verify the project name before continuing).
2. **APIs & services → OAuth consent screen** (a.k.a. "Google Auth Platform"):
   - Audience/User type: **External**.
   - App name + support email + developer contact.
   - **Authorized domains** (under Branding in the newer UI): add `ciamlogin.com` and `microsoftonline.com`.
   - App home page / privacy / ToS links are **optional** — skip unless you publish/verify.
3. **Credentials → Create credentials → OAuth client ID → Web application.**
4. **Authorized redirect URIs** — add all of these (fill in your tenant values):
   ```
   https://login.microsoftonline.com
   https://login.microsoftonline.com/te/<TENANT_ID>/oauth2/authresp
   https://login.microsoftonline.com/te/<TENANT_SUBDOMAIN>.onmicrosoft.com/oauth2/authresp
   https://<TENANT_ID>.ciamlogin.com/<TENANT_ID>/federation/oidc/accounts.google.com
   https://<TENANT_ID>.ciamlogin.com/<TENANT_SUBDOMAIN>.onmicrosoft.com/federation/oidc/accounts.google.com
   https://<TENANT_SUBDOMAIN>.ciamlogin.com/<TENANT_ID>/federation/oauth2
   https://<TENANT_SUBDOMAIN>.ciamlogin.com/<TENANT_SUBDOMAIN>.onmicrosoft.com/federation/oauth2
   ```
5. Create → copy the **Client ID** and **Client secret**.
6. **Audience tab**: while in **Testing** mode only listed **test users** can sign in. Add your
   users' Google emails, or **Publish** the app (basic scopes need no Google verification).

## Part B — Configure Google in Entra (External ID tenant)

- **External Identities → All identity providers → Built-in → Google → Configure.**
- Enter the Google **Client ID** + **Client secret** → Save.

## Part C — Create the user flow (this is what shows the Google button)

- **External Identities → User flows → New user flow** (e.g. `SignUpSignIn`), select **Google**.
- Open the flow → **Identity providers** → ensure Google is checked.
- Open the flow → **Applications → Add application** → select your SPA app reg → Save.

## Verify

- Google shows under **All identity providers**.
- The user flow lists Google and has your app attached.
- A test sign-in presents Google; test-mode shows a one-time "unverified app" screen (click through).

## Gotchas & learnings

- The **Google client secret is a real secret** — it lives **only** in the Entra Google config.
  Never in the repo/pipeline/`.env`.
- Google only ever redirects to **Entra's** endpoints (`ciamlogin.com`/`microsoftonline.com`), so
  `localhost` is **not** a Google authorized domain. Your app's `localhost` belongs only on the
  **SPA app registration** redirect URIs ([6](6-App-Registration-and-API-Scope.md)).
- Without a **user flow** that has the app attached, sign-in has no UI to invoke.

## Deferred / revisit later

- Frontend MSAL wiring + which claim carries the email — [8](8-Frontend-Auth-MSAL.md).
