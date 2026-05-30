export function mapSetupNetwork({ stations, lineSegments }) {
  const stationsById = new Map(stations.map((station) => [station.id, station]));
  const linesById = new Map();

  for (const row of lineSegments) {
    if (!linesById.has(row.line_id)) {
      linesById.set(row.line_id, {
        id: row.line_id,
        name: row.line_name,
        color: row.line_color,
        segments: [],
      });
    }

    linesById.get(row.line_id).segments.push({
      id: row.segment_id,
      fromStationId: row.station_a_id,
      toStationId: row.station_b_id,
      fromStation: stationsById.get(row.station_a_id),
      toStation: stationsById.get(row.station_b_id),
    });
  }

  return {
    stations,
    lines: [...linesById.values()],
  };
}
