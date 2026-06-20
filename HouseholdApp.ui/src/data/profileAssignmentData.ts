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

// Dispatching/removing a profile also creates/removes weekly assignments on the
// backend, so refresh the assignment queries (Runbook + progress) too.
const invalidateAfterDispatch = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries(['profileAssignments']);
  queryClient.invalidateQueries(['assignmentsByUserHousehold']);
  queryClient.invalidateQueries(['assignmentsByUser']);
  queryClient.invalidateQueries(['assignmentsByHousehold']);
};

export function useAssignProfileToUser() {
  const { post } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (pa: Omit<ProfileAssignment, 'id' | 'profile'>) => post<ProfileAssignment>(url, pa),
    { onSuccess: () => invalidateAfterDispatch(queryClient) },
  );
}

export function useRemoveProfileAssignment() {
  const { del } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (id: number) => del<void>(`${url}/${id}`),
    { onSuccess: () => invalidateAfterDispatch(queryClient) },
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
