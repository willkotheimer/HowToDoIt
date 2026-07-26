import React, {
  createContext, useContext, useState, useEffect,
} from 'react';
import { useMsal } from '@azure/msal-react';
import { AuthUser } from '../Types';

// UX-only gate for showing create/edit/upload controls. The server
// (RequireAuthForWritesFilter + Auth:AllowedWriters) is the real authority on
// who may write; this list only decides which controls to render.
const ALLOWED_EMAILS = ['wkotheimer@gmail.com'];

interface AuthContextValue {
  user: AuthUser | null;
  authed: boolean;   // signed in with any Entra account
  canWrite: boolean; // signed in AND on the writer allow-list
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authed: false,
  canWrite: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accounts } = useMsal();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    const account = accounts[0];
    if (account) {
      const claims = account.idTokenClaims as { email?: string; preferred_username?: string } | undefined;
      const email = (claims?.email ?? claims?.preferred_username ?? account.username ?? '').toLowerCase();
      setUser({ uid: account.localAccountId, displayName: account.name ?? '', email });
      setCanWrite(ALLOWED_EMAILS.includes(email));
    } else {
      setUser(null);
      setCanWrite(false);
    }
  }, [accounts]);

  return (
    <AuthContext.Provider value={{ user, authed: !!user, canWrite }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
