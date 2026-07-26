import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getJson, postJson } from './api';
import type { Category } from '../Types';

const categoriesUrl = '/Categories';

export function useCategories() {
  return useQuery<Category[]>(['categories'], () => getJson<Category[]>(categoriesUrl));
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation(
    (category: Pick<Category, 'categoryName'>) => postJson<Category>(categoriesUrl, category),
    { onSuccess: () => queryClient.invalidateQueries(['categories']) },
  );
}
