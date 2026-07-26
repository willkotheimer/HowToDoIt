import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getJson, postJson, putJson, deleteJson,
} from './api';
import type { WorkSequence, WorkSequenceInput } from '../Types';

const sequencesUrl = '/WorkSequences';

export function useSequences() {
  return useQuery<WorkSequence[]>(['sequences'], () => getJson<WorkSequence[]>(sequencesUrl));
}

export function useSequence(id: number, enabled = true) {
  return useQuery<WorkSequence>(
    ['sequence', id],
    () => getJson<WorkSequence>(`${sequencesUrl}/${id}`),
    { enabled: Boolean(enabled && id) },
  );
}

export function useCreateSequence() {
  const queryClient = useQueryClient();
  return useMutation(
    (sequence: WorkSequenceInput) => postJson<WorkSequence>(sequencesUrl, sequence),
    { onSuccess: () => queryClient.invalidateQueries(['sequences']) },
  );
}

export function useUpdateSequence() {
  const queryClient = useQueryClient();
  return useMutation(
    (sequence: WorkSequenceInput & { id: number }) => putJson<void>(`${sequencesUrl}/${sequence.id}`, sequence),
    {
      onSuccess: (_data, sequence) => {
        queryClient.invalidateQueries(['sequences']);
        queryClient.invalidateQueries(['sequence', sequence.id]);
      },
    },
  );
}

export function useDeleteSequence() {
  const queryClient = useQueryClient();
  return useMutation(
    (id: number) => deleteJson<void>(`${sequencesUrl}/${id}`),
    { onSuccess: () => queryClient.invalidateQueries(['sequences']) },
  );
}
