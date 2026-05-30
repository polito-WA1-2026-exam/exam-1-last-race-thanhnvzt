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
