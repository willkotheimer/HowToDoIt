import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../data/fbConnection';
import { useUsersHousehold, useUsersByHouseholdId } from '../data/houseHoldUsers';
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [uid, setUid] = useState('');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        currentUser.getIdToken().then((token) => {
          window.sessionStorage.setItem('token', token);
        });
        setUser({ uid: currentUser.uid, displayName: currentUser.displayName ?? '', email: currentUser.email ?? '' });
        setUid(currentUser.uid);
        setAuthed(ALLOWED_EMAILS.includes(currentUser.email ?? ''));
      } else {
        setUser(null);
        setUid('');
        setAuthed(false);
      }
    });
    return () => unsubscribe();
  }, []);

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
