import {randomItem} from "../../shared/random.js";

const MIN_ROUTE_SEGMENTS = 3;

export function buildNetworkGraph(stations, segments) {
  const graph = new Map(stations.map((station) => [station.id, []]));

  for (const segment of segments) {
    graph.get(segment.station_a_id)?.push(segment.station_b_id);
    graph.get(segment.station_b_id)?.push(segment.station_a_id);
  }

  return graph;
}

function computeDistances(graph, startStationId) {
  const distances = new Map([[startStationId, 0]]);
  const queue = [startStationId];

  for (let index = 0; index < queue.length; index += 1) {
    const stationId = queue[index];
    const nextDistance = distances.get(stationId) + 1;

    for (const neighborId of graph.get(stationId) || []) {
      if (!distances.has(neighborId)) {
        distances.set(neighborId, nextDistance);
        queue.push(neighborId);
      }
    }
  }

  return distances;
}

export function listEligibleStationPairs(stations, segments, minSegments = MIN_ROUTE_SEGMENTS) {
  const graph = buildNetworkGraph(stations, segments);
  const pairs = [];

  for (const startStation of stations) {
    const distances = computeDistances(graph, startStation.id);

    for (const destinationStation of stations) {
      if (startStation.id === destinationStation.id) continue;

      const distance = distances.get(destinationStation.id);
      if (distance >= minSegments) {
        pairs.push({
          startStationId: startStation.id,
          destinationStationId: destinationStation.id,
          distance,
        });
      }
    }
  }

  return pairs;
}

export function pickRandomStationPair(stations, segments) {
  const eligiblePairs = listEligibleStationPairs(stations, segments);

  if (eligiblePairs.length === 0) {
    throw new Error('No eligible start/destination pairs found');
  }

  return randomItem(eligiblePairs);
}
