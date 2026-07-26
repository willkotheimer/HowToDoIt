import type { FormEvent } from 'react';
import { msalInstance, loginRequest } from '../auth/msalConfig';

// Sign-in via Entra External ID redirect flow. Returns to the app origin, where
// index.tsx sets the active account. No backend provisioning: authorization is
// enforced server-side by the caller's email claim (Auth:AllowedWriters).
const loginClickEvent = async (e: FormEvent<HTMLButtonElement>) => {
  e.preventDefault();
  await msalInstance.loginRedirect(loginRequest);
};

const logoutClickEvent = () => {
  window.sessionStorage.removeItem('token');
  msalInstance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
};

export default { loginClickEvent, logoutClickEvent };
