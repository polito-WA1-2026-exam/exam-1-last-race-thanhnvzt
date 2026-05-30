import { listRanking } from './ranking.dao.js';
import { mapRanking } from './ranking.mapper.js';

export async function getRanking() {
  return { ranking: mapRanking(await listRanking()) };
}
