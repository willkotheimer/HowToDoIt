import type { FormEvent } from 'react';
import type { AccountInfo } from '@azure/msal-browser';
import { getJson, postJson, patchJson } from './api';
import { msalInstance, loginRequest } from '../auth/msalConfig';

const userDataUrl = '/Users';

interface UserRecord {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  firebaseKey: string;
}

// Pull first/last name out of the account display name (best effort).
const splitName = (account: AccountInfo) => {
  const full = account.name?.trim() ?? '';
  const [first, ...rest] = full.split(' ');
  return { first: first ?? '', last: rest.join(' ') };
};

const accountEmail = (account: AccountInfo): string => {
  const claims = account.idTokenClaims as { email?: string; preferred_username?: string } | undefined;
  return claims?.email ?? account.username ?? '';
};

// Link the backend user record on first Entra sign-in. The Entra object id
// (localAccountId) becomes the stable user key, stored in the FirebaseKey column.
//  1. Already linked by Entra id?  -> nothing to do.
//  2. Existing user with same email (migrated from Firebase)? -> re-link it.
//  3. Brand-new user? -> create the record.
export const provisionUser = async (account: AccountInfo) => {
  const key = account.localAccountId;
  try {
    await getJson(`${userDataUrl}/fbKey/${key}`);
    return; // already linked
  } catch {
    // not linked by key — try matching an existing record by email
  }

  const email = accountEmail(account);
  let existing: UserRecord | null = null;
  try {
    existing = await getJson<UserRecord>(`${userDataUrl}/email/${encodeURIComponent(email)}`);
  } catch {
    // no existing record for this email
  }

  if (existing) {
    await patchJson(`${userDataUrl}/link`, { Id: existing.id, FirebaseKey: key });
    return; // re-linked existing (migrated) user
  }

  const { first, last } = splitName(account);
  await postJson(`${userDataUrl}`, {
    FirebaseKey: key,
    FirstName: first,
    LastName: last,
    Email: email,
  });
};

const loginClickEvent = async (e: FormEvent<HTMLButtonElement>) => {
  e.preventDefault();
  // Redirect flow: navigates away to Entra/Google and returns to the app,
  // where the LOGIN_SUCCESS handler (index.tsx) provisions the user.
  await msalInstance.loginRedirect(loginRequest);
};

const logoutClickEvent = () => {
  window.sessionStorage.removeItem('token');
  msalInstance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
};

export default { loginClickEvent, logoutClickEvent };
