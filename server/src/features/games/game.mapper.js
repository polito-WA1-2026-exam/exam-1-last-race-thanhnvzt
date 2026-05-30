export function mapGameResult(result) {
  return result;
}

function mapGameStation(row, prefix) {
  return {
    id: row[`${prefix}_station_id`],
    name: row[`${prefix}_station_name`],
  };
}

export function mapPlanningGame(game, serverNow) {
  return {
    gameId: game.id,
    status: game.status,
    startStation: mapGameStation(game, 'start'),
    destinationStation: mapGameStation(game, 'destination'),
    planningDeadline: game.planning_deadline,
    serverNow,
    initialCoins: game.initial_coins,
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
    gameId: game.id,
    status,
    validRoute: false,
    invalidReason,
    initialCoins: game.initial_coins,
    finalCoins: 0,
    score: 0,
    steps: [],
    resolvedSteps: [],
  };
}

export function mapValidRouteResult({ game, scoredSteps, finalCoins, score }) {
  return {
    gameId: game.id,
    status: 'executed',
    validRoute: true,
    initialCoins: game.initial_coins,
    finalCoins,
    score,
    resolvedSteps: scoredSteps.map((step) => ({
      index: step.index,
      segmentId: step.segmentId,
      fromStationId: step.fromStationId,
      toStationId: step.toStationId,
      lineId: step.line.id,
    })),
    steps: scoredSteps.map((step) => ({
      index: step.index,
      fromStation: {
        id: step.fromStation.id,
        name: step.fromStation.name,
      },
      toStation: {
        id: step.toStation.id,
        name: step.toStation.name,
      },
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
