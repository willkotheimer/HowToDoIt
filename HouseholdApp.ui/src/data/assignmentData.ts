import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import { getJson, postJson, patchJson } from './api';
import type { Assignment } from '../Types';

const assignmentsURL = '/Assignments';
const assignmentsChores = '/AssignmentsChores';
const assignmentChoresUserURL = '/AssignmentsChoresUser';

const getAssignmentsByHouseholdFromUserId = async (id: number) => getJson<Assignment[]>(`${assignmentChoresUserURL}/household/user/${id}`);
const getAssignmentsByUserId = async (id: number) => getJson<Assignment[]>(`${assignmentsURL}/user/${id}`);
const setAssignmentAsDone = async (assignment: Partial<Assignment>) => patchJson<Assignment>(`${assignmentsURL}/done`, assignment);
const getAssignmentsByHouseHoldId = async (id: number) => getJson<Assignment[]>(`${assignmentsChores}/household/${id}`);
const createAssignment = async (assignment: Partial<Assignment>) => postJson<Assignment>(`${assignmentsURL}`, assignment);

export function useAssignmentsByHouseholdFromUserId(userId: number, enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<Assignment[]>(['assignmentsByUserHousehold', userId], () => get<Assignment[]>(`${assignmentChoresUserURL}/household/user/${userId}`), {
    enabled: Boolean(enabled && userId),
  });
}

export function useAssignmentsByUserId(userId: number, enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<Assignment[]>(['assignmentsByUser', userId], () => get<Assignment[]>(`${assignmentsURL}/user/${userId}`), {
    enabled: Boolean(enabled && userId),
  });
}

export function useAssignmentsByHouseHoldId(householdId: number, enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<Assignment[]>(['assignmentsByHousehold', householdId], () => get<Assignment[]>(`${assignmentsChores}/household/${householdId}`), {
    enabled: Boolean(enabled && householdId),
  });
}

export function useCreateAssignment() {
  const { post } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation((assignment: Partial<Assignment>) => post<Assignment>(`${assignmentsURL}`, assignment), {
    onSuccess: () => {
      queryClient.invalidateQueries(['assignmentsByUserHousehold']);
      queryClient.invalidateQueries(['assignmentsByUser']);
      queryClient.invalidateQueries(['assignmentsByHousehold']);
    },
  });
}

export function useSetAssignmentAsDone() {
  const { patch } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation((assignment: Partial<Assignment>) => patch<Assignment>(`${assignmentsURL}/done`, assignment), {
    onSuccess: () => {
      queryClient.invalidateQueries(['assignmentsByUserHousehold']);
      queryClient.invalidateQueries(['assignmentsByUser']);
      queryClient.invalidateQueries(['assignmentsByHousehold']);
    },
  });
}

export default {
  getAssignmentsByUserId,
  getAssignmentsByHouseHoldId,
  createAssignment,
  getAssignmentsByHouseholdFromUserId,
  setAssignmentAsDone,
  useAssignmentsByHouseholdFromUserId,
  useAssignmentsByUserId,
  useAssignmentsByHouseHoldId,
  useCreateAssignment,
  useSetAssignmentAsDone,
};
