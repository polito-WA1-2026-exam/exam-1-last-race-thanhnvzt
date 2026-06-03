function writeDebug(debug, event, details = {}) {
  if (debug) debug(event, details);
}

function buildRouteSteps(game, segmentIds, segmentsById, debug) {
  const steps = [];
  let currentStationId = game.start_station_id;

  for (let index = 0; index < segmentIds.length; index += 1) {
    writeDebug(debug, 'route-step.inspect', {
      index,
      segmentId: segmentIds[index],
      currentStationId,
      destinationStationId: game.destination_station_id,
    });

    if (currentStationId === game.destination_station_id) {
      writeDebug(debug, 'route-step.rejected', {
        index,
        reason: 'destination-reached-before-route-ended',
      });
      return {
        valid: false,
        reason: `Route reaches ${game.destination_station_name} and then continues.`,
      };
    }

    const segment = segmentsById.get(segmentIds[index]);
    if (!segment) {
      writeDebug(debug, 'route-step.rejected', {
        index,
        segmentId: segmentIds[index],
        reason: 'unknown-segment',
      });
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
      writeDebug(debug, 'route-step.rejected', {
        index,
        segmentId: segment.id,
        currentStationId,
        segmentStationAId: segment.station_a_id,
        segmentStationBId: segment.station_b_id,
        reason: 'disconnected-segment',
      });
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
    writeDebug(debug, 'route-step.accepted', steps[steps.length - 1]);
    currentStationId = toStationId;
  }

  if (currentStationId !== game.destination_station_id) {
    writeDebug(debug, 'route.rejected', {
      finalStationId: currentStationId,
      destinationStationId: game.destination_station_id,
      reason: 'destination-not-reached',
    });
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

function resolveLineAssignments(steps, stationLineIds, debug) {
  let paths = steps[0].lineOptions.map((lineId) => [lineId]);
  writeDebug(debug, 'line-assignment.initial-options', {
    stepIndex: 0,
    lineOptions: steps[0].lineOptions,
    candidatePaths: paths,
  });

  for (let stepIndex = 1; stepIndex < steps.length; stepIndex += 1) {
    const nextStep = steps[stepIndex];
    const sharedStationId = steps[stepIndex - 1].toStationId;
    const nextPaths = [];
    const attempts = [];

    for (const path of paths) {
      const previousLineId = path[path.length - 1];
      for (const nextLineId of nextStep.lineOptions) {
        const sameLine = previousLineId === nextLineId;
        const validInterchange =
          stationServesLine(stationLineIds, sharedStationId, previousLineId) &&
          stationServesLine(stationLineIds, sharedStationId, nextLineId);
        const accepted = sameLine || validInterchange;

        attempts.push({
          previousPath: path,
          previousLineId,
          nextLineId,
          sharedStationId,
          sameLine,
          validInterchange,
          accepted,
        });

        if (accepted) {
          nextPaths.push([...path, nextLineId]);
        }
      }
    }

    writeDebug(debug, 'line-assignment.step-options', {
      stepIndex,
      sharedStationId,
      nextStepLineOptions: nextStep.lineOptions,
      attempts,
      acceptedPaths: nextPaths,
    });

    if (nextPaths.length === 0) {
      writeDebug(debug, 'line-assignment.rejected', {
        stepIndex,
        sharedStationId,
        reason: 'no-compatible-line-path',
      });
      return null;
    }

    paths = nextPaths.sort((left, right) => left.join(':').localeCompare(right.join(':')));
  }

  writeDebug(debug, 'line-assignment.resolved', {
    selectedPath: paths[0],
    allCandidatePaths: paths,
  });
  return paths[0];
}

export function validateRoute({ game, segmentIds, segments, stationLineIds, debug }) {
  writeDebug(debug, 'validation.started', {
    startStationId: game.start_station_id,
    destinationStationId: game.destination_station_id,
    segmentIds,
    loadedSegmentIds: segments.map((segment) => segment.id),
    stationLineIds,
  });

  if (segmentIds.length === 0) {
    writeDebug(debug, 'validation.rejected', {
      reason: 'empty-route',
    });
    return {
      valid: false,
      reason: 'Route is empty.',
      resolvedSteps: [],
    };
  }

  const duplicateSegmentId = segmentIds.find(
    (segmentId, index) => segmentIds.indexOf(segmentId) !== index,
  );
  if (duplicateSegmentId !== undefined) {
    writeDebug(debug, 'validation.rejected', {
      reason: 'duplicate-segment',
      segmentId: duplicateSegmentId,
    });
    return {
      valid: false,
      reason: 'Route uses the same segment more than once.',
      resolvedSteps: [],
    };
  }

  const segmentsById = new Map(segments.map((segment) => [segment.id, segment]));
  const directedRoute = buildRouteSteps(game, segmentIds, segmentsById, debug);
  if (!directedRoute.valid) {
    writeDebug(debug, 'validation.rejected', {
      reason: directedRoute.reason,
    });
    return {
      valid: false,
      reason: directedRoute.reason,
      resolvedSteps: [],
    };
  }

  writeDebug(debug, 'route.directed', {
    steps: directedRoute.steps,
  });

  const lineAssignments = resolveLineAssignments(directedRoute.steps, stationLineIds, debug);
  if (!lineAssignments) {
    writeDebug(debug, 'validation.rejected', {
      reason: 'line-change-outside-interchange',
    });
    return {
      valid: false,
      reason: 'Route changes lines outside an interchange station.',
      resolvedSteps: [],
    };
  }

  const resolvedSteps = directedRoute.steps.map((step, index) => ({
    index,
    segmentId: step.segmentId,
    fromStationId: step.fromStationId,
    toStationId: step.toStationId,
    lineId: lineAssignments[index],
  }));
  writeDebug(debug, 'validation.accepted', {
    resolvedSteps,
  });

  return {
    valid: true,
    resolvedSteps,
  };
}
