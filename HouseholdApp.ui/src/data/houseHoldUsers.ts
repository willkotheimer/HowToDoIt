import { useQuery } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import { getJson } from './api';
import type { HouseholdUser } from '../Types';

const householdURL = '/HouseholdUser';

const getUsersHousehold = async (uID: string) => getJson<HouseholdUser[]>(`${householdURL}/UserHousehold/${uID}`);
const getHousehold = async (uID: string) => getJson<{ householdId: number }>(`${householdURL}/GetHouseId/${uID}`);

export function useUsersHousehold(uID: string, enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<HouseholdUser[]>(['userHousehold', uID], () => get<HouseholdUser[]>(`${householdURL}/UserHousehold/${uID}`), {
    enabled: Boolean(enabled && uID),
  });
}

export function useHousehold(uID: string, enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<{ householdId: number }>(['householdId', uID], () => get<{ householdId: number }>(`${householdURL}/GetHouseId/${uID}`), {
    enabled: Boolean(enabled && uID),
  });
}

export function useUsersByHouseholdId(householdId: number, enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<HouseholdUser[]>(
    ['usersByHousehold', householdId],
    () => get<HouseholdUser[]>(`${householdURL}/playbook/${householdId}`),
    { enabled: Boolean(enabled && householdId) },
  );
}

export default { getUsersHousehold, getHousehold, useUsersHousehold, useHousehold, useUsersByHouseholdId };
