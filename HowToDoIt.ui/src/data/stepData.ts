import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getJson, postJson, putJson, patchJson, deleteJson,
} from './api';
import type { WorkStep, WorkStepInput } from '../Types';

const stepsUrl = '/WorkSteps';

export function useStepsBySequence(sequenceId: number, enabled = true) {
  return useQuery<WorkStep[]>(
    ['steps', sequenceId],
    () => getJson<WorkStep[]>(`${stepsUrl}/sequence/${sequenceId}`),
    { enabled: Boolean(enabled && sequenceId) },
  );
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>, sequenceId: number) {
  queryClient.invalidateQueries(['steps', sequenceId]);
  queryClient.invalidateQueries(['sequence', sequenceId]);
}

export function useCreateStep(sequenceId: number) {
  const queryClient = useQueryClient();
  return useMutation(
    (step: WorkStepInput) => postJson<WorkStep>(stepsUrl, step),
    { onSuccess: () => invalidate(queryClient, sequenceId) },
  );
}

export function useUpdateStep(sequenceId: number) {
  const queryClient = useQueryClient();
  return useMutation(
    (step: WorkStepInput & { id: number }) => putJson<void>(`${stepsUrl}/${step.id}`, step),
    { onSuccess: () => invalidate(queryClient, sequenceId) },
  );
}

export function useReorderSteps(sequenceId: number) {
  const queryClient = useQueryClient();
  return useMutation(
    (ids: number[]) => patchJson<void>(`${stepsUrl}/order`, { Ids: ids }),
    { onSuccess: () => invalidate(queryClient, sequenceId) },
  );
}

export function useDeleteStep(sequenceId: number) {
  const queryClient = useQueryClient();
  return useMutation(
    (id: number) => deleteJson<void>(`${stepsUrl}/${id}`),
    { onSuccess: () => invalidate(queryClient, sequenceId) },
  );
}
