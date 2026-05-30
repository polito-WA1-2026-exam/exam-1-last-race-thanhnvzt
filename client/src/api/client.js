const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${SERVER_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error || 'API request failed');
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return await response.json();
}

export function apiGet(path) {
  return apiRequest(path);
}

export function apiPost(path, body) {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiDelete(path) {
  return apiRequest(path, {
    method: 'DELETE',
  });
}
