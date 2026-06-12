import {openDatabase} from '../../db/connection.js';

export async function listNetworkForSetup() {
    const db = openDatabase();
    try {
        const stations = await db.all(
            `SELECT st.id,
                    st.name,
                    st.x,
                    st.y,
                    COALESCE(served.line_count, 0) > 1 AS isInterchange
             FROM stations st
                      LEFT JOIN (SELECT s.station_id, COUNT(DISTINCT ls.line_id) AS line_count
                                 FROM (SELECT station_a_id AS station_id, id AS segment_id
                                       FROM segments
                                       UNION ALL
                                       SELECT station_b_id AS station_id, id AS segment_id
                                       FROM segments) s
                                          JOIN line_segments ls ON ls.segment_id = s.segment_id
                                 GROUP BY s.station_id) served ON served.station_id = st.id
             ORDER BY st.id`,
        );
        const rows = await db.all(
            `SELECT ml.id    AS line_id,
                    ml.name  AS line_name,
                    ml.color AS line_color,
                    ls.position,
                    s.id     AS segment_id,
                    s.station_a_id,
                    s.station_b_id
             FROM metro_lines ml
                      JOIN line_segments ls ON ls.line_id = ml.id
                      JOIN segments s ON s.id = ls.segment_id
             ORDER BY ml.id, ls.position`,
        );
        return {stations, lineSegments: rows};
    } finally {
        await db.close();
    }
}

