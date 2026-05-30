import {
  INITIAL_COINS,
  PLANING_TOLERANCE_SECONDS,
  PLANNING_DURATION_SECONDS,
} from '../../config/constants.js';
import { HttpError } from '../../shared/errors.js';
import { addSeconds, nowIso } from '../../shared/time.js';
import {
  getGameById,
  getGameByIdInTransaction,
  insertPlanningGame,
  listEventsInTransaction,
  listRouteSegmentsInTransaction,
  listStationLineIdsInTransaction,
  listStationsInTransaction,
  listSegmentsForPlanning,
  listStationsForPlanning,
  markGameExecutedInTransaction,
  markGameInvalidInTransaction,
  withTransaction,
} from './games.dao.js';
import {
  mapInvalidRouteResult,
  mapPlanningData,
  mapPlanningGame,
  mapValidRouteResult,
} from './game.mapper.js';
import { pickRandomStationPair } from './graph.service.js';
import { validateRoute } from './routeValidation.service.js';
import { scoreResolvedSteps } from './scoring.service.js';

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

function isSubmissionExpired(game, submittedAt) {
  const deadlineMs = Date.parse(game.planning_deadline);
  const acceptedUntilMs = deadlineMs + PLANING_TOLERANCE_SECONDS * 1000;
  return submittedAt.getTime() > acceptedUntilMs;
}

function enrichScoredSteps(scoredSteps, stationsById, linesById) {
  return scoredSteps.map((step) => ({
    ...step,
    fromStation: stationsById.get(step.fromStationId),
    toStation: stationsById.get(step.toStationId),
    line: linesById.get(step.lineId),
  }));
}

export async function submitRoute(gameId, userId, segmentIds) {
  return await withTransaction(async (db) => {
    const game = await getGameByIdInTransaction(db, gameId);

    if (!game) {
      throw new HttpError(404, 'Game not found');
    }

    if (game.user_id !== userId) {
      throw new HttpError(403, 'Game belongs to another user');
    }

    if (game.status !== 'planning') {
      throw new HttpError(409, 'Game is not in planning state');
    }

    const submittedAt = new Date();
    const submittedAtIso = submittedAt.toISOString();

    if (isSubmissionExpired(game, submittedAt)) {
      const reason = 'Planning deadline expired.';
      await markGameInvalidInTransaction(db, {
        gameId,
        submittedAt: submittedAtIso,
        status: 'expired',
        reason,
      });
      return mapInvalidRouteResult({ game, status: 'expired', invalidReason: reason });
    }

    const [segments, stationLineIds] = await Promise.all([
      listRouteSegmentsInTransaction(db, segmentIds),
      listStationLineIdsInTransaction(db),
    ]);

    const validation = validateRoute({
      game,
      segmentIds,
      segments,
      stationLineIds,
    });

    if (!validation.valid) {
      await markGameInvalidInTransaction(db, {
        gameId,
        submittedAt: submittedAtIso,
        status: 'invalid',
        reason: validation.reason,
      });
      return mapInvalidRouteResult({
        game,
        status: 'invalid',
        invalidReason: validation.reason,
      });
    }

    const [events, stations] = await Promise.all([
      listEventsInTransaction(db),
      listStationsInTransaction(db),
    ]);
    const stationsById = new Map(stations.map((station) => [station.id, station]));
    const linesById = new Map(
      segments.flatMap((segment) => segment.lines.map((line) => [line.id, line])),
    );

    const scoring = scoreResolvedSteps(validation.resolvedSteps, events, game.initial_coins);
    await markGameExecutedInTransaction(db, {
      gameId,
      submittedAt: submittedAtIso,
      finalCoins: scoring.finalCoins,
      score: scoring.score,
      scoredSteps: scoring.scoredSteps,
    });

    return mapValidRouteResult({
      game,
      finalCoins: scoring.finalCoins,
      score: scoring.score,
      scoredSteps: enrichScoredSteps(scoring.scoredSteps, stationsById, linesById),
    });
  });
}
