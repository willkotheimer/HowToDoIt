import { PublicClientApplication, type Configuration } from '@azure/msal-browser';

// Microsoft Entra External ID (CIAM) config. Values come from env vars
// (VITE_ENTRA_*) so the same build works against dev/prod tenants.
const clientId = import.meta.env.VITE_ENTRA_CLIENT_ID as string;
const authority = import.meta.env.VITE_ENTRA_AUTHORITY as string;

// The ciamlogin.com authority must be trusted explicitly.
const knownAuthorities = authority ? [new URL(authority).host] : [];

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    knownAuthorities,
    // Redirect flow returns to the app origin, where MsalProvider processes
    // the auth response on load. Matches the registered SPA redirect URI.
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
};

// Scope for calling our own API. Populated once "Expose an API" is configured
// in Entra and VITE_ENTRA_API_SCOPE is set; until then, no bearer token is sent.
export const apiScope = import.meta.env.VITE_ENTRA_API_SCOPE as string | undefined;

// Request the API scope at sign-in so an access token (with consent) is cached
// up front; otherwise silent token acquisition for the API fails and writes 401.
const baseScopes = ['openid', 'profile', 'email'];
export const loginRequest = {
  scopes: apiScope ? [...baseScopes, apiScope] : baseScopes,
};

export const tokenRequest = {
  scopes: apiScope ? [apiScope] : [],
};

// Single shared instance, used by both <MsalProvider> and the API layer.
export const msalInstance = new PublicClientApplication(msalConfig);
