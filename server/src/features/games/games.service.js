import { INITIAL_COINS, PLANNING_DURATION_SECONDS } from '../../config/constants.js';
import { HttpError } from '../../shared/errors.js';
import { addSeconds, nowIso } from '../../shared/time.js';
import {
  getGameById,
  insertPlanningGame,
  listSegmentsForPlanning,
  listStationsForPlanning,
} from './games.dao.js';
import { mapPlanningData, mapPlanningGame } from './game.mapper.js';
import { pickRandomStationPair } from './graph.service.js';

export async function createGame(userId) {
  const stations = await listStationsForPlanning();
  const segments = await listSegmentsForPlanning();
  const pair = pickRandomStationPair(stations, segments);
  const startedAt = new Date();
  const planningDeadline = addSeconds(startedAt, PLANNING_DURATION_SECONDS);

  const gameId = await insertPlanningGame({
    userId,
    startStationId: pair.startStationId,
    destinationStationId: pair.destinationStationId,
    startedAt: startedAt.toISOString(),
    planningDeadline: planningDeadline.toISOString(),
    initialCoins: INITIAL_COINS,
  });

  const game = await getGameById(gameId);
  return mapPlanningGame(game, nowIso());
}

export async function getPlanningData(gameId, userId) {
  const game = await getGameById(gameId);

  if (!game) {
    throw new HttpError(404, 'Game not found');
  }

  if (game.user_id !== userId) {
    throw new HttpError(403, 'Game belongs to another user');
  }

  if (game.status !== 'planning') {
    throw new HttpError(409, 'Game is not in planning state');
  }

  const [stations, segments] = await Promise.all([
    listStationsForPlanning(),
    listSegmentsForPlanning(),
  ]);

  return mapPlanningData({
    game,
    stations,
    segments,
    serverNow: nowIso(),
  });
}
