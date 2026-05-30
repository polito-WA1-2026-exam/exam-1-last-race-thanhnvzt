function buildRouteSteps(game, segmentIds, segmentsById) {
  const steps = [];
  let currentStationId = game.start_station_id;

  for (let index = 0; index < segmentIds.length; index += 1) {
    if (currentStationId === game.destination_station_id) {
      return {
        valid: false,
        reason: `Route reaches ${game.destination_station_name} and then continues.`,
      };
    }

    const segment = segmentsById.get(segmentIds[index]);
    if (!segment) {
      return {
        valid: false,
        reason: 'Route contains an unknown segment.',
      };
    }

    let toStationId;
    if (segment.station_a_id === currentStationId) {
      toStationId = segment.station_b_id;
    } else if (segment.station_b_id === currentStationId) {
      toStationId = segment.station_a_id;
    } else {
      return {
        valid: false,
        reason: 'Route has disconnected segments.',
      };
    }

    steps.push({
      index,
      segmentId: segment.id,
      fromStationId: currentStationId,
      toStationId,
      lineOptions: segment.lines.map((line) => line.id).sort((a, b) => a - b),
    });
    currentStationId = toStationId;
  }

  if (currentStationId !== game.destination_station_id) {
    return {
      valid: false,
      reason: `Route does not reach ${game.destination_station_name}.`,
    };
  }

  return { valid: true, steps };
}

function stationServesLine(stationLineIds, stationId, lineId) {
  return stationLineIds.get(stationId)?.has(lineId) || false;
}

function resolveLineAssignments(steps, stationLineIds) {
  let paths = steps[0].lineOptions.map((lineId) => [lineId]);

  for (let stepIndex = 1; stepIndex < steps.length; stepIndex += 1) {
    const nextStep = steps[stepIndex];
    const sharedStationId = steps[stepIndex - 1].toStationId;
    const nextPaths = [];

    for (const path of paths) {
      const previousLineId = path[path.length - 1];
      for (const nextLineId of nextStep.lineOptions) {
        const sameLine = previousLineId === nextLineId;
        const validInterchange =
          stationServesLine(stationLineIds, sharedStationId, previousLineId) &&
          stationServesLine(stationLineIds, sharedStationId, nextLineId);

        if (sameLine || validInterchange) {
          nextPaths.push([...path, nextLineId]);
        }
      }
    }

    if (nextPaths.length === 0) {
      return null;
    }

    paths = nextPaths.sort((left, right) => left.join(':').localeCompare(right.join(':')));
  }

  return paths[0];
}

export function validateRoute({ game, segmentIds, segments, stationLineIds }) {
  if (segmentIds.length === 0) {
    return {
      valid: false,
      reason: 'Route is empty.',
      resolvedSteps: [],
    };
  }

  const segmentsById = new Map(segments.map((segment) => [segment.id, segment]));
  const directedRoute = buildRouteSteps(game, segmentIds, segmentsById);
  if (!directedRoute.valid) {
    return {
      valid: false,
      reason: directedRoute.reason,
      resolvedSteps: [],
    };
  }

  const lineAssignments = resolveLineAssignments(directedRoute.steps, stationLineIds);
  if (!lineAssignments) {
    return {
      valid: false,
      reason: 'Route changes lines outside an interchange station.',
      resolvedSteps: [],
    };
  }

  return {
    valid: true,
    resolvedSteps: directedRoute.steps.map((step, index) => ({
      index,
      segmentId: step.segmentId,
      fromStationId: step.fromStationId,
      toStationId: step.toStationId,
      lineId: lineAssignments[index],
    })),
  };
}
