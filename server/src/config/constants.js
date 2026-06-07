const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value) => ['1', 'true', 'yes', 'on'].includes(
  String(value || '').toLowerCase(),
);

export const PORT = parseInteger(process.env.PORT, 3001);
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
export const SESSION_SECRET =
  process.env.SESSION_SECRET || 'development-secret-replace-later';
export const DATABASE_PATH = process.env.DATABASE_PATH || './db.sqlite';
export const PLANNING_DURATION_SECONDS = 90;
export const INITIAL_COINS = 20;
export const DEBUG_MODE = parseBoolean(process.env.DEBUG_MODE);
export const DEBUG_GAME_VALIDATION =
  DEBUG_MODE || parseBoolean(process.env.DEBUG_GAME_VALIDATION);
