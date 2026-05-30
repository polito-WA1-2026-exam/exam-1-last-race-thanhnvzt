export function parseIntegerParam(value, name) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || String(parsed) !== String(value)) {
    const error = new Error(`${name} must be an integer`);
    error.status = 400;
    throw error;
  }
  return parsed;
}
