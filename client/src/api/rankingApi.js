import { apiGet } from './client.js';

export function getRanking() {
  return apiGet('/ranking');
}
