const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function apiRequest(path, options = {}, requestOptions = {}) {
  const requestStartedAtMs = Date.now();
  const response = await fetch(`${SERVER_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  const responseReceivedAtMs = Date.now();

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.error || 'API request failed');
    error.status = response.status;
    throw error;
  }

  const data = response.status === 204 ? null : await response.json();

  if (!requestOptions.includeTiming) return data;

  return {
    ...data,
    serverTimeSync: {
      requestStartedAtMs,
      responseReceivedAtMs,
      roundTripMs: responseReceivedAtMs - requestStartedAtMs,
    },
  };
}

export function apiGet(path) {
  return apiRequest(path);
}

export function apiGetWithTiming(path) {
  return apiRequest(path, {}, { includeTiming: true });
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

export function apiPatch(path, body) {
  return apiRequest(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
