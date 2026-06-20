import { msalInstance, tokenRequest } from '../auth/msalConfig';

const baseUrl = import.meta.env.VITE_API_BASE_URL as string;

// Acquire an access token for the API, silently. Returns null when no API
// scope is configured yet or no user is signed in (so calls stay anonymous).
export async function getAccessToken(): Promise<string | null> {
  if (tokenRequest.scopes.length === 0) return null;
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];
  if (!account) return null;
  try {
    const result = await msalInstance.acquireTokenSilent({ ...tokenRequest, account });
    return result.accessToken;
  } catch {
    return null;
  }
}

async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function postForm<T>(endpoint: string, formData: FormData): Promise<T> {
  // No Content-Type header: the browser sets the multipart boundary itself.
  // Auth must be set explicitly here since this headers object replaces the defaults.
  const token = await getAccessToken();
  return fetcher<T>(`${baseUrl}${endpoint}`, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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
