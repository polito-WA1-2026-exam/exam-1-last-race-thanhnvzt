export const dropSchemaSql = `
DROP TABLE IF EXISTS game_steps;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS line_segments;
DROP TABLE IF EXISTS segments;
DROP TABLE IF EXISTS metro_lines;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS users;
`;

export const createSchemaSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL
);

CREATE TABLE stations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL
);

CREATE TABLE metro_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL
);

CREATE TABLE segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_a_id INTEGER NOT NULL,
  station_b_id INTEGER NOT NULL,
  FOREIGN KEY (station_a_id) REFERENCES stations(id),
  FOREIGN KEY (station_b_id) REFERENCES stations(id),
  CHECK (station_a_id <> station_b_id),
  UNIQUE (station_a_id, station_b_id)
);

CREATE TABLE line_segments (
  line_id INTEGER NOT NULL,
  segment_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (line_id, segment_id),
  FOREIGN KEY (line_id) REFERENCES metro_lines(id),
  FOREIGN KEY (segment_id) REFERENCES segments(id),
  UNIQUE (line_id, position)
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL UNIQUE,
  effect INTEGER NOT NULL CHECK (effect BETWEEN -4 AND 4)
);

CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planning', 'executed', 'invalid', 'expired')),
  start_station_id INTEGER NOT NULL,
  destination_station_id INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  planning_deadline TEXT NOT NULL,
  planning_draft_segment_ids TEXT NOT NULL DEFAULT '[]',
  planning_draft_updated_at TEXT,
  submitted_at TEXT,
  initial_coins INTEGER NOT NULL DEFAULT 20,
  final_coins INTEGER,
  score INTEGER,
  valid_route INTEGER NOT NULL DEFAULT 0 CHECK (valid_route IN (0, 1)),
  invalid_reason TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (start_station_id) REFERENCES stations(id),
  FOREIGN KEY (destination_station_id) REFERENCES stations(id),
  CHECK (start_station_id <> destination_station_id)
);

CREATE TABLE game_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  step_index INTEGER NOT NULL,
  from_station_id INTEGER NOT NULL,
  to_station_id INTEGER NOT NULL,
  line_id INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  coins_after_step INTEGER NOT NULL,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (from_station_id) REFERENCES stations(id),
  FOREIGN KEY (to_station_id) REFERENCES stations(id),
  FOREIGN KEY (line_id) REFERENCES metro_lines(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  UNIQUE (game_id, step_index)
);
`;
