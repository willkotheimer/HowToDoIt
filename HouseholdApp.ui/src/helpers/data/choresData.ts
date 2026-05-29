import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import { getJson, postJson, patchJson } from './api';
import type { Chore } from '../../Types';

const choresURL = '/Chores';

const getChoresByHousehold = async (id: number) => getJson<Chore[]>(`${choresURL}/household/${id}`);
const getUnassignedChoresByWeekAndHouseHold = async (week: number, householdId: number) => getJson<Chore[]>(`${choresURL}/household/${householdId}/${week}/unassigned`);
const getChoreById = async (choreId: number) => getJson<Chore>(`${choresURL}/${choreId}`);
const addChore = async (chore: Partial<Chore>) => postJson<Chore>(`${choresURL}`, chore);
const updateChore = async (chore: Partial<Chore>) => patchJson<Chore>(`${choresURL}`, chore);

export function useChoresByHousehold(householdId: number, enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<Chore[]>(['chores', householdId], () => get<Chore[]>(`${choresURL}/household/${householdId}`), {
    enabled: Boolean(enabled && householdId),
  });
}

export function useUnassignedChoresByWeekAndHouseHold(week: number, householdId: number, enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<Chore[]>(['unassignedChores', householdId, week], () => get<Chore[]>(`${choresURL}/household/${householdId}/${week}/unassigned`), {
    enabled: Boolean(enabled && householdId),
  });
}

export function useChoreById(choreId: number, enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<Chore>(['chore', choreId], () => get<Chore>(`${choresURL}/${choreId}`), {
    enabled: Boolean(enabled && choreId),
  });
}

export function useAddChore() {
  const { post } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation((chore: Partial<Chore>) => post<Chore>(`${choresURL}`, chore), {
    onSuccess: () => queryClient.invalidateQueries(['chores']),
  });
}

export function useUpdateChore() {
  const { patch } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation((chore: Partial<Chore>) => patch<Chore>(`${choresURL}`, chore), {
    onSuccess: () => queryClient.invalidateQueries(['chores']),
  });
}

export default {
  getChoresByHousehold,
  getUnassignedChoresByWeekAndHouseHold,
  getChoreById,
  addChore,
  updateChore,
  useChoresByHousehold,
  useUnassignedChoresByWeekAndHouseHold,
  useChoreById,
  useAddChore,
  useUpdateChore,
};
