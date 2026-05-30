import { apiDelete, apiGet, apiPost } from './client.js';

export function login(credentials) {
  return apiPost('/sessions', credentials);
}

export function logout() {
  return apiDelete('/sessions/current');
}

export function getCurrentSession() {
  return apiGet('/sessions/current');
}
