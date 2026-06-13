import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import { getJson, postJson, patchJson } from './api';
import type { Assignment } from '../Types';
import { useAuth } from '../context/AuthContext';
import {
  addSandboxAssignment,
  completeSandboxAssignment,
  mergeSandboxAssignments,
  mergeSandboxAssignmentsForUser,
} from './sandbox/assignments';

const assignmentsURL = '/Assignments';
const assignmentsChores = '/AssignmentsChores';
const assignmentChoresUserURL = '/AssignmentsChoresUser';

const getAssignmentsByHouseholdFromUserId = async (id: number) => getJson<Assignment[]>(`${assignmentChoresUserURL}/playbook/user/${id}`);
const getAssignmentsByUserId = async (id: number) => getJson<Assignment[]>(`${assignmentsURL}/user/${id}`);
const setAssignmentAsDone = async (assignment: Partial<Assignment>) => patchJson<Assignment>(`${assignmentsURL}/done`, assignment);
const getAssignmentsByHouseHoldId = async (id: number) => getJson<Assignment[]>(`${assignmentsChores}/playbook/${id}`);
const createAssignment = async (assignment: Partial<Assignment>) => postJson<Assignment>(`${assignmentsURL}`, assignment);

export function useAssignmentsByHouseholdFromUserId(userId: number, enabled = true) {
  const { authed } = useAuth();
  const { get } = useAPIRequest();
  return useQuery<Assignment[]>(
    ['assignmentsByUserHousehold', userId],
    async () => {
      const apiData = await get<Assignment[]>(`${assignmentChoresUserURL}/playbook/user/${userId}`);
      return authed ? apiData : mergeSandboxAssignmentsForUser(apiData, userId);
    },
    { enabled: Boolean(enabled && userId) },
  );
}

export function useAssignmentsByUserId(userId: number, enabled = true) {
  const { authed } = useAuth();
  const { get } = useAPIRequest();
  return useQuery<Assignment[]>(
    ['assignmentsByUser', userId],
    async () => {
      const apiData = await get<Assignment[]>(`${assignmentsURL}/user/${userId}`);
      return authed ? apiData : mergeSandboxAssignmentsForUser(apiData, userId);
    },
    { enabled: Boolean(enabled && userId) },
  );
}

export function useAssignmentsByHouseHoldId(householdId: number, enabled = true) {
  const { authed } = useAuth();
  const { get } = useAPIRequest();
  return useQuery<Assignment[]>(
    ['assignmentsByHousehold', householdId],
    async () => {
      const apiData = await get<Assignment[]>(`${assignmentsChores}/playbook/${householdId}`);
      return authed ? apiData : mergeSandboxAssignments(apiData);
    },
    { enabled: Boolean(enabled && householdId) },
  );
}

export function useCreateAssignment() {
  const { authed } = useAuth();
  const { post } = useAPIRequest();
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries(['assignmentsByUserHousehold']);
    queryClient.invalidateQueries(['assignmentsByUser']);
    queryClient.invalidateQueries(['assignmentsByHousehold']);
    queryClient.invalidateQueries(['unassignedChores']);
  };
  return useMutation(
    (assignment: Partial<Assignment> & { chorename?: string; firstname?: string }) => {
      if (!authed) {
        addSandboxAssignment(assignment);
        return Promise.resolve(assignment as Assignment);
      }
      return post<Assignment>(`${assignmentsURL}`, assignment);
    },
    { onSuccess: invalidate },
  );
}

export function useSetAssignmentAsDone() {
  const { authed } = useAuth();
  const { patch } = useAPIRequest();
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries(['assignmentsByUserHousehold']);
    queryClient.invalidateQueries(['assignmentsByUser']);
    queryClient.invalidateQueries(['assignmentsByHousehold']);
  };
  return useMutation(
    (assignment: Partial<Assignment>) => {
      if (!authed) {
        const id = assignment.id ?? assignment.assignmentId;
        if (id !== undefined) completeSandboxAssignment(id);
        return Promise.resolve(assignment as Assignment);
      }
      return patch<Assignment>(`${assignmentsURL}/done`, assignment);
    },
    { onSuccess: invalidate },
  );
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
