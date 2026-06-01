import type { HouseholdUser, AuthUser } from '../../Types';

const SANDBOX_NAMES: Record<number, string> = {
  2: 'John',
  4: 'Joey',
  5: 'Marsha',
};

// Fixed ID for a signed-in non-authed user injected into the sandbox household
export const SANDBOX_SELF_ID = -9999;

export function applySandboxMemberNames(members: HouseholdUser[]): HouseholdUser[] {
  return members.map((m) => ({
    ...m,
    firstname: SANDBOX_NAMES[m.id] ?? m.firstname,
  }));
}

// Assignments from the joined API endpoint carry `firstname` directly on each row
export function sanitizeAssignmentNames(assignments: any[]): any[] {
  return assignments.map((a) => ({
    ...a,
    firstname: SANDBOX_NAMES[a.userId] ?? a.firstname,
  }));
}

// When a real (non-allowed) Google user is signed in, inject them into the sandbox household
export function injectSignedInUser(members: HouseholdUser[], user: AuthUser): HouseholdUser[] {
  const firstname = user.displayName?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'Guest';
  return [
    ...members,
    {
      id: SANDBOX_SELF_ID,
      firstname,
      firebaseKey: user.uid,
      email: user.email,
    },
  ];
}
