import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import type { ProfileChore, Chore } from '../Types';

const url = '/ProfileChores';

export function useProfileChores(profileId: number) {
  const { get } = useAPIRequest();
  return useQuery<ProfileChore[]>(
    ['profileChores', profileId],
    () => get<ProfileChore[]>(`${url}/${profileId}`),
    { enabled: Boolean(profileId) },
  );
}

// Profiles that contain a given chore (one chore can belong to multiple profiles).
export function useChoreProfiles(choreId: number) {
  const { get } = useAPIRequest();
  return useQuery<ProfileChore[]>(
    ['choreProfiles', choreId],
    () => get<ProfileChore[]>(`${url}/bychore/${choreId}`),
    { enabled: Boolean(choreId) },
  );
}

export function useUnassignedToProfile(householdId: number) {
  const { get } = useAPIRequest();
  return useQuery<Chore[]>(
    ['unassignedToProfile', householdId],
    () => get<Chore[]>(`${url}/unassigned/${householdId}`),
    { enabled: Boolean(householdId) },
  );
}

export function useAddChoreToProfile() {
  const { post } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (pc: Pick<ProfileChore, 'profileId' | 'choreId'>) => post<ProfileChore>(url, pc),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profileChores']);
        queryClient.invalidateQueries(['choreProfiles']);
        queryClient.invalidateQueries(['unassignedToProfile']);
      },
    },
  );
}

export function useRemoveChoreFromProfile() {
  const { del } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (id: number) => del<void>(`${url}/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profileChores']);
        queryClient.invalidateQueries(['choreProfiles']);
        queryClient.invalidateQueries(['unassignedToProfile']);
      },
    },
  );
}

export function useRemoveChoreFromProfileByIds() {
  const { del } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    ({ choreId, profileId }: { choreId: number; profileId: number }) =>
      del<void>(`${url}/bychore/${choreId}/profile/${profileId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profileChores']);
        queryClient.invalidateQueries(['choreProfiles']);
        queryClient.invalidateQueries(['unassignedToProfile']);
      },
    },
  );
}
