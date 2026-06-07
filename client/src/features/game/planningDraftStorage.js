function storageKey(gameId) {
  return `last-race:planning-draft:${gameId}`;
}

export function loadLocalPlanningDraft(gameId) {
  try {
    const draft = JSON.parse(window.localStorage.getItem(storageKey(gameId)) || 'null');
    if (!draft || !Array.isArray(draft.segmentIds)) return null;

    return {
      segmentIds: draft.segmentIds.filter((segmentId) => Number.isInteger(segmentId)),
      updatedAt: draft.updatedAt,
    };
  } catch {
    return null;
  }
}

export function saveLocalPlanningDraft(gameId, segmentIds) {
  try {
    window.localStorage.setItem(
      storageKey(gameId),
      JSON.stringify({
        segmentIds,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Local draft recovery is best-effort; server draft remains authoritative.
  }
}

export function clearLocalPlanningDraft(gameId) {
  try {
    window.localStorage.removeItem(storageKey(gameId));
  } catch {
    // Local draft recovery is best-effort; server draft remains authoritative.
  }
}
