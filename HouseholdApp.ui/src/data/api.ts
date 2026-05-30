import { baseUrl } from '../helpers/config.json';

async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Fetch error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export async function getJson<T>(endpoint: string): Promise<T> {
  return fetcher<T>(`${baseUrl}${endpoint}`);
}

export async function postJson<T>(endpoint: string, body: unknown): Promise<T> {
  return fetcher<T>(`${baseUrl}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function patchJson<T>(endpoint: string, body: unknown): Promise<T> {
  return fetcher<T>(`${baseUrl}${endpoint}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteJson<T>(endpoint: string): Promise<T> {
  return fetcher<T>(`${baseUrl}${endpoint}`, {
    method: 'DELETE',
  });
}
