import { useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from './api';

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(endpoint: string, method: RequestMethod, body?: unknown): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export function useAPIRequest() {
  const queryClient = useQueryClient();

  const get = async <T>(endpoint: string): Promise<T> => request<T>(endpoint, 'GET');
  const post = async <T>(endpoint: string, body?: unknown): Promise<T> => request<T>(endpoint, 'POST', body);
  const put = async <T>(endpoint: string, body?: unknown): Promise<T> => request<T>(endpoint, 'PUT', body);
  const patch = async <T>(endpoint: string, body?: unknown): Promise<T> => request<T>(endpoint, 'PATCH', body);
  const del = async <T>(endpoint: string): Promise<T> => request<T>(endpoint, 'DELETE');

  return {
    get,
    post,
    put,
    patch,
    del,
    queryClient,
  };
}
