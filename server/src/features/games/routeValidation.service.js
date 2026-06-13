import { randomItem } from '../../shared/random.js';

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
      lineOptions: segment.lines.map((line) => line.id),
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

function resolveLineAssignments(steps) {
  const lineAssignments = [randomItem(steps[0].lineOptions)];

  for (let stepIndex = 1; stepIndex < steps.length; stepIndex += 1) {
    const nextStep = steps[stepIndex];
    const previousLineId = lineAssignments[stepIndex - 1];

    if (nextStep.lineOptions.includes(previousLineId)) {
      lineAssignments.push(previousLineId);
      continue;
    }

    lineAssignments.push(randomItem(nextStep.lineOptions));
  }

  return lineAssignments;
}

export function validateRoute({
  game,
  segmentIds,
  segments,
}) {
  if (segmentIds.length === 0) {
    return {
      valid: false,
      reason: 'Route is empty.',
      resolvedSteps: [],
    };
  }

  const seen = new Set();
  const duplicateSegmentId = segmentIds.find((id) => {
    if (seen.has(id)) return true;
    seen.add(id);
    return false;
  });

  if (duplicateSegmentId !== undefined) {
    return {
      valid: false,
      reason: 'Route uses the same segment more than once.',
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

  const lineAssignments = resolveLineAssignments(directedRoute.steps);

  const resolvedSteps = directedRoute.steps.map((step, index) => ({
    index,
    segmentId: step.segmentId,
    fromStationId: step.fromStationId,
    toStationId: step.toStationId,
    lineId: lineAssignments[index],
  }));

  return {
    valid: true,
    resolvedSteps,
  };
}
