import { GAME_STATUS } from '../../config/constants.js';


function mapGameStation(row, prefix) {
  return {
    id: row[`${prefix}_station_id`],
    name: row[`${prefix}_station_name`],
  };
}

function mapBaseGameProperties(game) {
  return {
    gameId: game.id,
    startStation: mapGameStation(game, 'start'),
    destinationStation: mapGameStation(game, 'destination'),
    initialCoins: game.initial_coins,
  };
}

function mapRouteStation(station) {
  return {
    id: station.id,
    name: station.name,
    x: station.x,
    y: station.y,
  };
}

export function mapPlanningGame(game, serverNow) {
  return {
    ...mapBaseGameProperties(game),
    status: game.status,
    planningDeadline: game.planning_deadline,
    serverNow,
    draftSegmentIds: JSON.parse(game.planning_draft_segment_ids || '[]'),
    draftUpdatedAt: game.planning_draft_updated_at,
  };
}

export function mapPlanningSegment(row) {
  return {
    id: row.id,
    stationA: {
      id: row.station_a_id,
      name: row.station_a_name,
    },
    stationB: {
      id: row.station_b_id,
      name: row.station_b_name,
    },
  };
}

export function mapPlanningData({ game, stations, segments, serverNow }) {
  return {
    ...mapPlanningGame(game, serverNow),
    stations,
    segments: segments.map(mapPlanningSegment),
  };
}

export function mapInvalidRouteResult({ game, status, invalidReason }) {
  return {
    ...mapBaseGameProperties(game),
    status,
    validRoute: false,
    invalidReason,
    finalCoins: 0,
    score: 0,
    steps: [],
  };
}

export function mapValidRouteResult({ game, stations, scoredSteps, finalCoins, score }) {
  return {
    ...mapBaseGameProperties(game),
    status: GAME_STATUS.EXECUTED,
    validRoute: true,
    finalCoins,
    score,
    stations,
    steps: scoredSteps.map((step) => ({
      index: step.index,
      fromStation: mapRouteStation(step.fromStation),
      toStation: mapRouteStation(step.toStation),
      line: {
        id: step.line.id,
        name: step.line.name,
        color: step.line.color,
      },
      event: {
        description: step.event.description,
        effect: step.event.effect,
      },
      coinsAfterStep: step.coinsAfterStep,
    })),
  };
}

export function mapStoredGameResult({ game, stations, steps }) {
  const base = {
    ...mapBaseGameProperties(game),
    status: game.status,
    validRoute: game.valid_route === 1,
    invalidReason: game.invalid_reason,
    finalCoins: game.final_coins,
    score: game.score,
  };

  if (game.status === GAME_STATUS.INVALID || game.status === GAME_STATUS.EXPIRED) {
    return {
      ...base,
      stations: [],
      steps: [],
    };
  }

  return {
    ...base,
    stations,
    steps,
  };
}
