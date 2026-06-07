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
    gameId: game.id,
    status,
    validRoute: false,
    invalidReason,
    startStation: mapGameStation(game, 'start'),
    destinationStation: mapGameStation(game, 'destination'),
    initialCoins: game.initial_coins,
    finalCoins: 0,
    score: 0,
    steps: [],
    resolvedSteps: [],
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

export function mapValidRouteResult({ game, stations, scoredSteps, finalCoins, score }) {
  return {
    gameId: game.id,
    status: 'executed',
    validRoute: true,
    startStation: mapGameStation(game, 'start'),
    destinationStation: mapGameStation(game, 'destination'),
    initialCoins: game.initial_coins,
    finalCoins,
    score,
    stations,
    resolvedSteps: scoredSteps.map((step) => ({
      index: step.index,
      segmentId: step.segmentId,
      fromStationId: step.fromStationId,
      toStationId: step.toStationId,
      lineId: step.line.id,
    })),
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
  if (game.status === 'invalid' || game.status === 'expired') {
    return {
      gameId: game.id,
      status: game.status,
      validRoute: false,
      invalidReason: game.invalid_reason,
      startStation: mapGameStation(game, 'start'),
      destinationStation: mapGameStation(game, 'destination'),
      initialCoins: game.initial_coins,
      finalCoins: game.final_coins,
      score: game.score,
      stations: [],
      resolvedSteps: [],
      steps: [],
    };
  }

  return {
    gameId: game.id,
    status: game.status,
    validRoute: game.valid_route === 1,
    invalidReason: game.invalid_reason,
    startStation: mapGameStation(game, 'start'),
    destinationStation: mapGameStation(game, 'destination'),
    initialCoins: game.initial_coins,
    finalCoins: game.final_coins,
    score: game.score,
    stations,
    resolvedSteps: steps.map((step) => ({
      index: step.index,
      fromStationId: step.fromStation.id,
      toStationId: step.toStation.id,
      lineId: step.line.id,
    })),
    steps,
  };
}
