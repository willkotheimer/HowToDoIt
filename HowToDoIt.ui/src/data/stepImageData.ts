import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getJson, postForm, patchJson, deleteJson,
} from './api';
import type { StepImage } from '../Types';

const imagesUrl = '/StepImages';

export function useImagesByStep(stepId: number, enabled = true) {
  return useQuery<StepImage[]>(
    ['stepImages', stepId],
    () => getJson<StepImage[]>(`${imagesUrl}/step/${stepId}`),
    { enabled: Boolean(enabled && stepId) },
  );
}

// The sequenceId is passed so mutations can refresh the full sequence detail.
export function useUploadStepImage(sequenceId?: number) {
  const queryClient = useQueryClient();
  return useMutation(
    (formData: FormData) => postForm<StepImage>(`${imagesUrl}/upload`, formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['stepImages']);
        if (sequenceId) queryClient.invalidateQueries(['sequence', sequenceId]);
      },
    },
  );
}

export function useReorderStepImages(sequenceId?: number) {
  const queryClient = useQueryClient();
  return useMutation(
    (ids: number[]) => patchJson<void>(`${imagesUrl}/order`, { Ids: ids }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['stepImages']);
        if (sequenceId) queryClient.invalidateQueries(['sequence', sequenceId]);
      },
    },
  );
}

export function useDeleteStepImage(sequenceId?: number) {
  const queryClient = useQueryClient();
  return useMutation(
    (id: number) => deleteJson<void>(`${imagesUrl}/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['stepImages']);
        if (sequenceId) queryClient.invalidateQueries(['sequence', sequenceId]);
      },
    },
  );
}
