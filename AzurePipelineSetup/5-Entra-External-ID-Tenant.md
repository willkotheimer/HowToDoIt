# 5 — Entra External ID Tenant

[← 4 SQL](4-SQL-Database.md) · [Index](README.md) · Next: [6 — App Registration](6-App-Registration-and-API-Scope.md)

## Goal

Create the **customer/consumer** identity directory (CIAM) that your app's users sign in to.
This is the Azure‑native equivalent of consumer auth (the modern successor to Azure AD B2C).

> Use **External ID** for consumer/customer sign-in (email + social). Use plain **Entra ID**
> (workforce) only for org/employee accounts — wrong fit for a public/consumer app.

## Do in Azure (portal — this part is interactive, not Bicep)

1. Sign in to the **Microsoft Entra admin center** (`entra.microsoft.com`) with rights to create tenants.
2. **Entra ID → Overview → Manage tenants → Create → External → Continue.**
3. Basics: **Tenant name**, **domain** (`<TENANT_SUBDOMAIN>` → `<TENANT_SUBDOMAIN>.onmicrosoft.com`), region.
4. Billing: first external tenant often offers a **free trial that needs no subscription** — fine to
   start; you can link a subscription later. Otherwise link a subscription + resource group.
5. **Review + create.** Provisioning can take **up to ~30 minutes**.
6. **Switch into the new tenant** (top-right Settings → Directories + subscriptions → Switch). Confirm
   the directory name changes from your default/workforce directory.
7. On **Tenant overview**, copy **Tenant ID** (`<TENANT_ID>`) and **Primary domain**.

## Key values you'll reuse

- Authority (CIAM): `https://<TENANT_SUBDOMAIN>.ciamlogin.com/<TENANT_ID>` (see MSAL gotcha in [8](8-Frontend-Auth-MSAL.md)).
- Issuer (from OIDC metadata) is typically
  `https://<TENANT_ID>.ciamlogin.com/<TENANT_ID>/v2.0` — note it uses the **tenant‑ID subdomain**.
- OIDC metadata: `https://<TENANT_SUBDOMAIN>.ciamlogin.com/<TENANT_ID>/v2.0/.well-known/openid-configuration`

## Verify

- You can switch into the tenant and **App registrations is empty** (a fresh external tenant).
- The `.well-known/openid-configuration` URL above returns JSON.

## Gotchas & learnings

- **It's a separate directory.** Your subscription's "Default Directory" (workforce) is *not* it.
  If App registrations shows pre-existing apps (service connections, Static Web Apps app regs),
  you're in the wrong directory — switch tenants.
- Tenant creation is **interactive/portal**; it can't be fully Bicep'd. The subdomain is essentially
  arbitrary (just globally unique) and **unrelated** to where your app is hosted.
- Provisioning lag means the new tenant may not appear in the switcher immediately — wait & refresh.

## Deferred / revisit later

- App registration, redirect URIs, and the API scope are [6](6-App-Registration-and-API-Scope.md).
- The social provider (Google) is [7](7-Google-Federation.md).
- A **user flow** (sign-up/sign-in) must exist and have the app + provider attached before sign-in
  works — covered in [7](7-Google-Federation.md).
