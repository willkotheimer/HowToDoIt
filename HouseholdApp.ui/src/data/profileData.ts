import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import type { Profile } from '../Types';

const url = '/Profiles';

export function useProfiles(householdId: number) {
  const { get } = useAPIRequest();
  return useQuery<Profile[]>(
    ['profiles', householdId],
    () => get<Profile[]>(`${url}/household/${householdId}`),
    { enabled: Boolean(householdId) },
  );
}

export function useCreateProfile() {
  const { post } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (profile: Omit<Profile, 'id'>) => post<Profile>(url, profile),
    { onSuccess: () => queryClient.invalidateQueries(['profiles']) },
  );
}

export function useUpdateProfile() {
  const { patch } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (profile: Profile) => patch<Profile>(url, profile),
    { onSuccess: () => queryClient.invalidateQueries(['profiles']) },
  );
}

export function useDeleteProfile() {
  const { del } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (id: number) => del<void>(`${url}/${id}`),
    { onSuccess: () => queryClient.invalidateQueries(['profiles']) },
  );
}
