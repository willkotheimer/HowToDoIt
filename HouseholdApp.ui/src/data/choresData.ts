import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import { getJson, postJson, patchJson } from './api';
import type { Chore } from '../Types';
import { useAuth } from '../context/AuthContext';
import {
  addSandboxChore,
  editSandboxChore,
  getSandboxChore,
  applyEditToChore,
  mergeSandboxChores,
  mergeSandboxUnassigned,
} from './sandbox/chores';

const choresURL = '/Chores';

const getChoresByHousehold = async (id: number) => getJson<Chore[]>(`${choresURL}/household/${id}`);
const getUnassignedChoresByWeekAndHouseHold = async (week: number, householdId: number) => getJson<Chore[]>(`${choresURL}/household/${householdId}/${week}/unassigned`);
const getChoreById = async (choreId: number) => getJson<Chore>(`${choresURL}/${choreId}`);
const addChore = async (chore: Partial<Chore>) => postJson<Chore>(`${choresURL}`, chore);
const updateChore = async (chore: Partial<Chore>) => patchJson<Chore>(`${choresURL}`, chore);

export function useChoresByHousehold(householdId: number, enabled = true) {
  const { authed } = useAuth();
  const { get } = useAPIRequest();
  return useQuery<Chore[]>(
    ['chores', householdId],
    async () => {
      const apiData = await get<Chore[]>(`${choresURL}/household/${householdId}`);
      return authed ? apiData : mergeSandboxChores(apiData);
    },
    { enabled: Boolean(enabled && householdId) },
  );
}

export function useUnassignedChoresByWeekAndHouseHold(week: number, householdId: number, enabled = true) {
  const { authed } = useAuth();
  const { get } = useAPIRequest();
  return useQuery<Chore[]>(
    ['unassignedChores', householdId, week],
    async () => {
      const apiData = await get<Chore[]>(`${choresURL}/household/${householdId}/${week}/unassigned`);
      return authed ? apiData : mergeSandboxUnassigned(apiData, week);
    },
    { enabled: Boolean(enabled && householdId) },
  );
}

export function useChoreById(choreId: number, enabled = true) {
  const { authed } = useAuth();
  const { get } = useAPIRequest();
  return useQuery<Chore>(
    ['chore', choreId],
    async () => {
      if (choreId < 0) {
        return getSandboxChore(choreId) ?? ({} as Chore);
      }
      const apiData = await get<Chore>(`${choresURL}/${choreId}`);
      return authed ? apiData : applyEditToChore(apiData);
    },
    { enabled: Boolean(enabled && choreId) },
  );
}

export function useAddChore() {
  const { authed } = useAuth();
  const { post } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (chore: Partial<Chore>) => authed
      ? post<Chore>(`${choresURL}`, chore)
      : Promise.resolve(addSandboxChore(chore)),
    { onSuccess: () => queryClient.invalidateQueries(['chores']) },
  );
}

export function useUpdateChore() {
  const { authed } = useAuth();
  const { patch } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation(
    (chore: Partial<Chore>) => {
      if (!authed) {
        const choreId = chore.id ?? chore.Id;
        if (choreId !== undefined) editSandboxChore(choreId, chore);
        return Promise.resolve(chore as Chore);
      }
      return patch<Chore>(`${choresURL}`, chore);
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['chores']),
    },
  );
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
