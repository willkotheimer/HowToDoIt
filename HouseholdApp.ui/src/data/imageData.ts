import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import { getJson, postJson, deleteJson, postForm } from './api';
import type { ImageRecord } from '../Types';

const imagesUrl = '/Images';

const getImagesByChoreId = async (choreId: number) => getJson<ImageRecord[]>(`${imagesUrl}/${choreId}`);
const getMainImageByChoreId = async () => getJson<ImageRecord[]>(`${imagesUrl}/oneperchore`);
const addImage = async (image: Partial<ImageRecord>) => postJson<ImageRecord>(`${imagesUrl}`, image);
const deleteImage = async (imageId: number) => deleteJson<void>(`${imagesUrl}/${imageId}`);

export function useImagesByChoreId(choreId: number, enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<ImageRecord[]>(['imagesByChore', choreId], () => get<ImageRecord[]>(`${imagesUrl}/${choreId}`), {
    enabled: Boolean(enabled && choreId),
  });
}

export function useMainImages(enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<ImageRecord[]>(['mainImages'], () => get<ImageRecord[]>(`${imagesUrl}/oneperchore`), {
    enabled,
  });
}

export function useAddImage() {
  const { post } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation((image: Partial<ImageRecord>) => post<ImageRecord>(`${imagesUrl}`, image), {
    onSuccess: () => queryClient.invalidateQueries(['imagesByChore']),
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation((formData: FormData) => postForm<ImageRecord>(`${imagesUrl}/upload`, formData), {
    onSuccess: () => queryClient.invalidateQueries(['imagesByChore']),
  });
}

export function useDeleteImage() {
  const { del } = useAPIRequest();
  const queryClient = useQueryClient();
  return useMutation((imageId: number) => del<void>(`${imagesUrl}/${imageId}`), {
    onSuccess: () => queryClient.invalidateQueries(['imagesByChore']),
  });
}

export default {
  getImagesByChoreId,
  getMainImageByChoreId,
  addImage,
  deleteImage,
  useImagesByChoreId,
  useMainImages,
  useAddImage,
  useDeleteImage,
};
