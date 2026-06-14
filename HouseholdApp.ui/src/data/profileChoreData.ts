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
        queryClient.invalidateQueries(['unassignedToProfile']);
      },
    },
  );
}
