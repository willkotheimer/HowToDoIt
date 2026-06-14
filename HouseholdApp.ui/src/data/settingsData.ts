import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import type { HouseholdSettings } from '../Types';

const url = '/HouseholdSettings';

export function useHouseholdSettings(householdId: number) {
  const { get } = useAPIRequest();
  return useQuery<HouseholdSettings>(
    ['householdSettings', householdId],
    () => get<HouseholdSettings>(`${url}/${householdId}`),
    { enabled: Boolean(householdId) },
  );
}

export function useUpdateHouseholdSettings() {
  const { patch } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (settings: HouseholdSettings) => patch<void>(url, settings),
    { onSuccess: () => queryClient.invalidateQueries(['householdSettings']) },
  );
}
