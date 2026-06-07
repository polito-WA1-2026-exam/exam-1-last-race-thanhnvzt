import {
  INITIAL_COINS,
  PLANNING_DURATION_SECONDS,
} from '../../config/constants.js';
import { HttpError } from '../../shared/errors.js';
import { addSeconds, nowIso } from '../../shared/time.js';
import {
  getGameById,
  getGameByIdInTransaction,
  getResultGameById,
  insertPlanningGame,
  listEventsInTransaction,
  listGameSteps,
  listRouteSegmentsInTransaction,
  listStationLineIdsInTransaction,
  listStationsInTransaction,
  listSegmentsForPlanning,
  listStationsForPlanning,
  markGameExecutedInTransaction,
  markGameInvalidInTransaction,
  updatePlanningDraftInTransaction,
  withTransaction,
} from './games.dao.js';
import {
  mapInvalidRouteResult,
  mapPlanningData,
  mapPlanningGame,
  mapStoredGameResult,
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
  return submittedAt.getTime() > deadlineMs;
}

function parseStoredDraftSegmentIds(game) {
  try {
    const segmentIds = JSON.parse(game.planning_draft_segment_ids || '[]');
    if (Array.isArray(segmentIds) && segmentIds.every((id) => Number.isInteger(id))) {
      return segmentIds;
    }
  } catch {
    // Broken draft data should not crash route submission.
  }

  return [];
}

function enrichScoredSteps(scoredSteps, stationsById, linesById) {
  return scoredSteps.map((step) => ({
    ...step,
    fromStation: stationsById.get(step.fromStationId),
    toStation: stationsById.get(step.toStationId),
    line: linesById.get(step.lineId),
  }));
}

export async function savePlanningDraft(gameId, userId, segmentIds) {
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

    const updatedAt = new Date();
    if (isSubmissionExpired(game, updatedAt)) {
      throw new HttpError(409, 'Planning deadline expired');
    }

    const updatedAtIso = updatedAt.toISOString();
    await updatePlanningDraftInTransaction(db, {
      gameId,
      segmentIds,
      updatedAt: updatedAtIso,
    });

    return {
      gameId,
      draftSegmentIds: segmentIds,
      draftUpdatedAt: updatedAtIso,
      serverNow: nowIso(),
    };
  });
}

export async function submitRoute(gameId, userId, segmentIds, options = {}) {
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

    const submittedAfterDeadline = isSubmissionExpired(game, submittedAt);
    const routeSegmentIds =
      submittedAfterDeadline && options.triggeredByTimeout === true
        ? parseStoredDraftSegmentIds(game)
        : segmentIds;

    if (submittedAfterDeadline && options.triggeredByTimeout !== true) {
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
      listRouteSegmentsInTransaction(db, routeSegmentIds),
      listStationLineIdsInTransaction(db),
    ]);

    const requestedUniqueSegmentIds = new Set(routeSegmentIds);
    if (segments.length !== requestedUniqueSegmentIds.size) {
      throw new HttpError(422, 'Route contains an unknown segment.');
    }

    const validation = validateRoute({
      game,
      segmentIds: routeSegmentIds,
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
      stations,
      finalCoins: scoring.finalCoins,
      score: scoring.score,
      scoredSteps: enrichScoredSteps(scoring.scoredSteps, stationsById, linesById),
    });
  });
}

function mapStepRow(row) {
  return {
    index: row.step_index,
    fromStation: {
      id: row.from_station_id,
      name: row.from_station_name,
      x: row.from_station_x,
      y: row.from_station_y,
    },
    toStation: {
      id: row.to_station_id,
      name: row.to_station_name,
      x: row.to_station_x,
      y: row.to_station_y,
    },
    line: {
      id: row.line_id,
      name: row.line_name,
      color: row.line_color,
    },
    event: {
      description: row.event_description,
      effect: row.event_effect,
    },
    coinsAfterStep: row.coins_after_step,
  };
}

export async function getGameResult(gameId, userId) {
  const game = await getResultGameById(gameId);

  if (!game) {
    throw new HttpError(404, 'Game not found');
  }

  if (game.user_id !== userId) {
    throw new HttpError(403, 'Game belongs to another user');
  }

  if (game.status === 'planning') {
    throw new HttpError(409, 'Game is not finished yet');
  }

  const [steps, stations] = await Promise.all([
    game.status === 'executed' ? listGameSteps(gameId) : [],
    game.status === 'executed' ? listStationsForPlanning() : [],
  ]);

  return mapStoredGameResult({
    game,
    stations,
    steps: steps.map(mapStepRow),
  });
}
