import { openDatabase } from '../../db/connection.js';

export async function listStations() {
  const db = openDatabase();
  try {
    return await db.all(
      'SELECT id, name, x, y, is_interchange AS isInterchange FROM stations ORDER BY id',
    );
  } finally {
    await db.close();
  }
}

export async function listLinesWithSegments() {
  const db = openDatabase();
  try {
    return await db.all(
      `SELECT
        ml.id AS line_id,
        ml.name AS line_name,
        ml.color AS line_color,
        ls.position,
        s.id AS segment_id,
        s.station_a_id,
        s.station_b_id
      FROM metro_lines ml
      JOIN line_segments ls ON ls.line_id = ml.id
      JOIN segments s ON s.id = ls.segment_id
      ORDER BY ml.id, ls.position`,
    );
  } finally {
    await db.close();
  }
}

export async function listNetworkForSetup() {
  const db = openDatabase();
  try {
    const stations = await db.all(
      'SELECT id, name, x, y, is_interchange AS isInterchange FROM stations ORDER BY id',
    );
    const rows = await db.all(
      `SELECT
        ml.id AS line_id,
        ml.name AS line_name,
        ml.color AS line_color,
        ls.position,
        s.id AS segment_id,
        s.station_a_id,
        s.station_b_id
      FROM metro_lines ml
      JOIN line_segments ls ON ls.line_id = ml.id
      JOIN segments s ON s.id = ls.segment_id
      ORDER BY ml.id, ls.position`,
    );
    return { stations, lineSegments: rows };
  } finally {
    await db.close();
  }
}

export async function listSegmentsWithServingLines() {
  const db = openDatabase();
  try {
    return await db.all(
      `SELECT
        s.id AS segment_id,
        s.station_a_id,
        s.station_b_id,
        ml.id AS line_id,
        ml.name AS line_name
      FROM segments s
      JOIN line_segments ls ON ls.segment_id = s.id
      JOIN metro_lines ml ON ml.id = ls.line_id
      ORDER BY s.id, ml.id`,
    );
  } finally {
    await db.close();
  }
}
