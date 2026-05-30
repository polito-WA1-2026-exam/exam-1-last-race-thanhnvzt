import { apiGet, apiPost } from './client.js';

export function getSetupNetwork() {
  return apiGet('/network/setup');
}

export function createGame() {
  return apiPost('/games');
}

export function getPlanningData(gameId) {
  return apiGet(`/games/${gameId}/planning`);
}

export function submitRoute(gameId, segmentIds) {
  return apiPost(`/games/${gameId}/route`, { segmentIds });
}

export function getGameResult(gameId) {
  return apiGet(`/games/${gameId}/result`);
}
