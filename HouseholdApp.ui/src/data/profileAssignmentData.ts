import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import type { ProfileAssignment } from '../Types';

const url = '/ProfileAssignments';

export function useProfileAssignmentsByWeek(householdId: number, week: number) {
  const { get } = useAPIRequest();
  return useQuery<ProfileAssignment[]>(
    ['profileAssignments', householdId, week],
    () => get<ProfileAssignment[]>(`${url}/household/${householdId}/week/${week}`),
    { enabled: Boolean(householdId && week) },
  );
}

export function useProfileAssignmentsByUser(userId: number) {
  const { get } = useAPIRequest();
  return useQuery<ProfileAssignment[]>(
    ['profileAssignmentsByUser', userId],
    () => get<ProfileAssignment[]>(`${url}/user/${userId}`),
    { enabled: Boolean(userId) },
  );
}

export function useAssignProfileToUser() {
  const { post } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (pa: Omit<ProfileAssignment, 'id' | 'profile'>) => post<ProfileAssignment>(url, pa),
    { onSuccess: () => queryClient.invalidateQueries(['profileAssignments']) },
  );
}

export function useRemoveProfileAssignment() {
  const { del } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (id: number) => del<void>(`${url}/${id}`),
    { onSuccess: () => queryClient.invalidateQueries(['profileAssignments']) },
  );
}

export function useRolloverWeek() {
  const { post } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (req: { householdId: number; fromWeek: number; toWeek: number }) =>
      post<void>(`${url}/rollover`, req),
    { onSuccess: () => queryClient.invalidateQueries(['profileAssignments']) },
  );
}
