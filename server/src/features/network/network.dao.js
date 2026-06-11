import { openDatabase } from '../../db/connection.js';

export async function listStations() {
  const db = openDatabase();
  try {
    return await db.all(
      `SELECT
        st.id,
        st.name,
        st.x,
        st.y,
        COALESCE(served.line_count, 0) > 1 AS isInterchange
      FROM stations st
      LEFT JOIN (
        SELECT station_id, COUNT(DISTINCT line_id) AS line_count
        FROM (
          SELECT s.station_a_id AS station_id, ls.line_id
          FROM segments s
          JOIN line_segments ls ON ls.segment_id = s.id
          UNION
          SELECT s.station_b_id AS station_id, ls.line_id
          FROM segments s
          JOIN line_segments ls ON ls.segment_id = s.id
        )
        GROUP BY station_id
      ) served ON served.station_id = st.id
      ORDER BY st.id`,
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
      `SELECT
        st.id,
        st.name,
        st.x,
        st.y,
        COALESCE(served.line_count, 0) > 1 AS isInterchange
      FROM stations st
      LEFT JOIN (
        SELECT station_id, COUNT(DISTINCT line_id) AS line_count
        FROM (
          SELECT s.station_a_id AS station_id, ls.line_id
          FROM segments s
          JOIN line_segments ls ON ls.segment_id = s.id
          UNION
          SELECT s.station_b_id AS station_id, ls.line_id
          FROM segments s
          JOIN line_segments ls ON ls.segment_id = s.id
        )
        GROUP BY station_id
      ) served ON served.station_id = st.id
      ORDER BY st.id`,
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
