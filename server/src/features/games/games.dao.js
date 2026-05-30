import { openDatabase } from '../../db/connection.js';

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
