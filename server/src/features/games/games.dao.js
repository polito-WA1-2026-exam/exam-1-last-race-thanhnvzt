import { openDatabase } from '../../db/connection.js';

export async function withTransaction(work) {
  const db = openDatabase();
  try {
    await db.exec('BEGIN IMMEDIATE TRANSACTION;');
    const result = await work(db);
    await db.exec('COMMIT;');
    return result;
  } catch (err) {
    await db.exec('ROLLBACK;').catch(() => {});
    throw err;
  } finally {
    await db.close();
  }
}

export async function listStationsForPlanning() {
  const db = openDatabase();
  try {
    return await db.all('SELECT id, name, x, y FROM stations ORDER BY id');
  } finally {
    await db.close();
  }
}

export async function listSegmentsForPlanning() {
  const db = openDatabase();
  try {
    return await db.all(
      `SELECT
        seg.id,
        seg.station_a_id,
        seg.station_b_id,
        station_a.name AS station_a_name,
        station_b.name AS station_b_name
      FROM segments seg
      JOIN stations station_a ON station_a.id = seg.station_a_id
      JOIN stations station_b ON station_b.id = seg.station_b_id
      ORDER BY station_a.name, station_b.name`,
    );
  } finally {
    await db.close();
  }
}

export async function insertPlanningGame({
  userId,
  startStationId,
  destinationStationId,
  startedAt,
  planningDeadline,
  initialCoins,
}) {
  const db = openDatabase();
  try {
    const result = await db.run(
      `INSERT INTO games (
        user_id,
        status,
        start_station_id,
        destination_station_id,
        started_at,
        planning_deadline,
        initial_coins
      )
      VALUES (?, 'planning', ?, ?, ?, ?, ?)`,
      [
        userId,
        startStationId,
        destinationStationId,
        startedAt,
        planningDeadline,
        initialCoins,
      ],
    );
    return result.lastID;
  } finally {
    await db.close();
  }
}

export async function getGameById(gameId) {
  const db = openDatabase();
  try {
    return await db.get(
      `SELECT
        g.id,
        g.user_id,
        g.status,
        g.start_station_id,
        start_station.name AS start_station_name,
        g.destination_station_id,
        destination_station.name AS destination_station_name,
        g.started_at,
        g.planning_deadline,
        g.initial_coins
      FROM games g
      JOIN stations start_station ON start_station.id = g.start_station_id
      JOIN stations destination_station ON destination_station.id = g.destination_station_id
      WHERE g.id = ?`,
      [gameId],
    );
  } finally {
    await db.close();
  }
}

export async function getResultGameById(gameId) {
  const db = openDatabase();
  try {
    return await db.get(
      `SELECT
        g.id,
        g.user_id,
        g.status,
        g.start_station_id,
        start_station.name AS start_station_name,
        g.destination_station_id,
        destination_station.name AS destination_station_name,
        g.initial_coins,
        g.final_coins,
        g.score,
        g.valid_route,
        g.invalid_reason
      FROM games g
      JOIN stations start_station ON start_station.id = g.start_station_id
      JOIN stations destination_station ON destination_station.id = g.destination_station_id
      WHERE g.id = ?`,
      [gameId],
    );
  } finally {
    await db.close();
  }
}

export async function listGameSteps(gameId) {
  const db = openDatabase();
  try {
    return await db.all(
      `SELECT
        gs.step_index,
        from_station.id AS from_station_id,
        from_station.name AS from_station_name,
        from_station.x AS from_station_x,
        from_station.y AS from_station_y,
        to_station.id AS to_station_id,
        to_station.name AS to_station_name,
        to_station.x AS to_station_x,
        to_station.y AS to_station_y,
        ml.id AS line_id,
        ml.name AS line_name,
        ml.color AS line_color,
        e.description AS event_description,
        e.effect AS event_effect,
        gs.coins_after_step
      FROM game_steps gs
      JOIN stations from_station ON from_station.id = gs.from_station_id
      JOIN stations to_station ON to_station.id = gs.to_station_id
      JOIN metro_lines ml ON ml.id = gs.line_id
      JOIN events e ON e.id = gs.event_id
      WHERE gs.game_id = ?
      ORDER BY gs.step_index`,
      [gameId],
    );
  } finally {
    await db.close();
  }
}

export async function getGameByIdInTransaction(db, gameId) {
  return await db.get(
    `SELECT
      g.id,
      g.user_id,
      g.status,
      g.start_station_id,
      start_station.name AS start_station_name,
      g.destination_station_id,
      destination_station.name AS destination_station_name,
      g.started_at,
      g.planning_deadline,
      g.initial_coins
    FROM games g
    JOIN stations start_station ON start_station.id = g.start_station_id
    JOIN stations destination_station ON destination_station.id = g.destination_station_id
    WHERE g.id = ?`,
    [gameId],
  );
}

export async function listRouteSegmentsInTransaction(db, segmentIds) {
  if (segmentIds.length === 0) return [];

  const uniqueSegmentIds = [...new Set(segmentIds)];
  const placeholders = uniqueSegmentIds.map(() => '?').join(', ');
  const rows = await db.all(
    `SELECT
      seg.id AS segment_id,
      seg.station_a_id,
      seg.station_b_id,
      ml.id AS line_id,
      ml.name AS line_name,
      ml.color AS line_color
    FROM segments seg
    JOIN line_segments ls ON ls.segment_id = seg.id
    JOIN metro_lines ml ON ml.id = ls.line_id
    WHERE seg.id IN (${placeholders})
    ORDER BY seg.id, ml.id`,
    uniqueSegmentIds,
  );

  const segmentsById = new Map();
  for (const row of rows) {
    if (!segmentsById.has(row.segment_id)) {
      segmentsById.set(row.segment_id, {
        id: row.segment_id,
        station_a_id: row.station_a_id,
        station_b_id: row.station_b_id,
        lines: [],
      });
    }

    segmentsById.get(row.segment_id).lines.push({
      id: row.line_id,
      name: row.line_name,
      color: row.line_color,
    });
  }

  return [...segmentsById.values()];
}

export async function listStationLineIdsInTransaction(db) {
  const rows = await db.all(
    `SELECT
      seg.station_a_id,
      seg.station_b_id,
      ls.line_id
    FROM segments seg
    JOIN line_segments ls ON ls.segment_id = seg.id`,
  );

  const stationLineIds = new Map();
  for (const row of rows) {
    for (const stationId of [row.station_a_id, row.station_b_id]) {
      if (!stationLineIds.has(stationId)) {
        stationLineIds.set(stationId, new Set());
      }
      stationLineIds.get(stationId).add(row.line_id);
    }
  }

  return stationLineIds;
}

export async function listStationsInTransaction(db) {
  return await db.all('SELECT id, name, x, y FROM stations ORDER BY id');
}

export async function listEventsInTransaction(db) {
  return await db.all('SELECT id, description, effect FROM events ORDER BY id');
}

export async function markGameInvalidInTransaction(db, { gameId, submittedAt, status, reason }) {
  await db.run(
    `UPDATE games
    SET
      status = ?,
      submitted_at = ?,
      final_coins = 0,
      score = 0,
      valid_route = 0,
      invalid_reason = ?
    WHERE id = ?`,
    [status, submittedAt, reason, gameId],
  );
}

export async function markGameExecutedInTransaction(
  db,
  { gameId, submittedAt, finalCoins, score, scoredSteps },
) {
  await db.run(
    `UPDATE games
    SET
      status = 'executed',
      submitted_at = ?,
      final_coins = ?,
      score = ?,
      valid_route = 1,
      invalid_reason = NULL
    WHERE id = ?`,
    [submittedAt, finalCoins, score, gameId],
  );

  for (const step of scoredSteps) {
    await db.run(
      `INSERT INTO game_steps (
        game_id,
        step_index,
        from_station_id,
        to_station_id,
        line_id,
        event_id,
        coins_after_step
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        gameId,
        step.index,
        step.fromStationId,
        step.toStationId,
        step.lineId,
        step.eventId,
        step.coinsAfterStep,
      ],
    );
  }
}
