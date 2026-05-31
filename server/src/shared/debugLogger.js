import { DEBUG_GAME_VALIDATION } from '../config/constants.js';

function normalizeForLog(value) {
  if (value instanceof Map) {
    return Object.fromEntries(
      [...value.entries()].map(([key, nestedValue]) => [key, normalizeForLog(nestedValue)]),
    );
  }

  if (value instanceof Set) {
    return [...value].sort((left, right) => left - right);
  }

  if (Array.isArray(value)) {
    return value.map(normalizeForLog);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeForLog(nestedValue)]),
    );
  }

  return value;
}

export function logGameValidationDebug(event, details = {}) {
  if (!DEBUG_GAME_VALIDATION) return;

  console.debug(
    `[game-validation] ${event}`,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        ...normalizeForLog(details),
      },
      null,
      2,
    ),
  );
}
