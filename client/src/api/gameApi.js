import { apiGet, apiGetWithTiming, apiPatch, apiPost } from './client.js';

export function getSetupNetwork() {
  return apiGet('/network/setup');
}

export function createGame() {
  return apiPost('/games');
}

export function getPlanningData(gameId) {
  return apiGetWithTiming(`/games/${gameId}/planning`);
}

export function savePlanningDraft(gameId, segmentIds) {
  return apiPatch(`/games/${gameId}/planning-draft`, { segmentIds });
}

export function submitRoute(gameId, segmentIds, { triggeredByTimeout = false } = {}) {
  return apiPost(`/games/${gameId}/route`, { segmentIds, triggeredByTimeout });
}

export function getGameResult(gameId) {
  return apiGet(`/games/${gameId}/result`);
}
