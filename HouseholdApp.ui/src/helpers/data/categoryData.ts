import { useQuery } from '@tanstack/react-query';
import { useAPIRequest } from './useAPIRequest';
import { getJson } from './api';
import type { Category } from '../../Types';

const categoriesURL = '/Categories';

const getAllCategories = async () => getJson<Category[]>(`${categoriesURL}`);

export function useCategories(enabled = true) {
  const { get } = useAPIRequest();
  return useQuery<Category[]>(['categories'], () => get<Category[]>(`${categoriesURL}`), {
    enabled,
  });
}

export default { getAllCategories, useCategories };
