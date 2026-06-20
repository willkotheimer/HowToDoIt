import React, {
  createContext, useContext, useState, useEffect, useRef,
} from 'react';
import { useMsal } from '@azure/msal-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUsersHousehold, useUsersByHouseholdId } from '../data/houseHoldUsers';
import { provisionUser } from '../data/authData';
import { AuthUser, HouseholdUser } from '../Types';
import { householdId as CONFIG_HOUSEHOLD_ID } from '../helpers/config.json';
import { applySandboxMemberNames, injectSignedInUser } from '../data/sandbox/members';

const ENV_HOUSEHOLD_ID: number = CONFIG_HOUSEHOLD_ID;
const ALLOWED_EMAILS = ['rkotheimer@gmail.com', 'wkotheimer@gmail.com'];

interface AuthContextValue {
  user: AuthUser | null;
  uid: string;
  authed: boolean;
  userHousehold: HouseholdUser[];
  householdId: number;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  uid: '',
  authed: false,
  userHousehold: [],
  householdId: 0,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accounts } = useMsal();
  const queryClient = useQueryClient();
  const provisionedRef = useRef<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [uid, setUid] = useState('');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const account = accounts[0];
    if (account) {
      const claims = account.idTokenClaims as { email?: string; preferred_username?: string } | undefined;
      const email = (claims?.email ?? claims?.preferred_username ?? account.username ?? '').toLowerCase();
      setUser({ uid: account.localAccountId, displayName: account.name ?? '', email });
      setUid(account.localAccountId);
      setAuthed(ALLOWED_EMAILS.includes(email));

      // Link this Entra identity to the backend user (idempotent), then refetch
      // the household. Runs once per account, including on refresh.
      if (provisionedRef.current !== account.localAccountId) {
        provisionedRef.current = account.localAccountId;
        provisionUser(account)
          .then(() => queryClient.invalidateQueries(['userHousehold']))
          .catch((err) => console.error('User provisioning failed', err));
      }
    } else {
      setUser(null);
      setUid('');
      setAuthed(false);
    }
  }, [accounts, queryClient]);

  // When authed: fetch by firebase uid. When not: fetch by env household id.
  const { data: userHouseholdByUid = [] } = useUsersHousehold(uid);
  const { data: userHouseholdById = [] } = useUsersByHouseholdId(ENV_HOUSEHOLD_ID, !authed);
  const sandboxMembers = applySandboxMemberNames(userHouseholdById);
  const userHousehold = authed
    ? userHouseholdByUid
    : user
      ? injectSignedInUser(sandboxMembers, user)
      : sandboxMembers;

  const householdId = authed
    ? (userHouseholdByUid[0]?.householdId ?? 0)
    : ENV_HOUSEHOLD_ID;

  return (
    <AuthContext.Provider value={{ user, uid, authed, userHousehold, householdId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
