export function mapSetupNetwork({ stations, lineSegments }) {
  const mappedStations = stations.map((station) => ({
    ...station,
    isInterchange: Boolean(station.isInterchange),
  }));
  const stationsById = new Map(mappedStations.map((station) => [station.id, station]));
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
    stations: mappedStations,
    lines: [...linesById.values()],
  };
}
