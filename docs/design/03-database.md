# Database Design

This document maps the [Domain Model](./02-domain-model.md) to SQLite. Raw SQL
should be kept in DAO modules, not inside Express routes or React components.

## Table Summary

| Table | Purpose |
| --- | --- |
| `users` | Registered users and salted password credentials. |
| `stations` | Fixed station list and display coordinates. |
| `metro_lines` | Fixed line names and colors. |
| `segments` | Undirected direct connections between two stations. |
| `line_segments` | Which line serves each segment and in what order. |
| `events` | Random event descriptions and coin effects. |
| `games` | Game attempts, assigned stations, status, final score. |
| `game_steps` | Executed route steps and event outcomes. |

## DDL Plan

```sql
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
```

## Segment Storage Rule

Store each undirected segment once with a deterministic order:

```txt
station_a_id = smaller station id
station_b_id = larger station id
```

DAO functions that receive a route step should normalize the pair before
looking up a segment. This avoids duplicates such as `A-B` and `B-A`.

## DAO Functions

### Authentication

- `getUserByUsername(username)`
- `getUserById(id)`

### Network

- `listNetworkForSetup()`
  - Returns lines, stations, and line-ordered connections for the full setup map.
- `listPlanningData(gameId, userId)`
  - Returns station names, assigned start/destination, and segment list.
  - Does not return line connections for the planning map.
- `listSegmentsWithLines()`
  - Internal helper for validation.

### Game Lifecycle

- `createGame(userId)`
  - Picks a random start and destination at least 3 stops apart.
  - Inserts a `planning` game with a 90-second deadline.
- `getGameForUser(gameId, userId)`
  - Prevents access to another user's game.
- `submitRoute(gameId, userId, selectedSegmentIds, submittedAt)`
  - Runs validation and execution inside one transaction.
  - Updates `games`.
  - Inserts `game_steps` only for valid executed routes.
- `listGameResult(gameId, userId)`
- `listRanking()`
  - Returns each user's best score, sorted descending.

### Seed and Utility

- `seedDatabase()`
  - Optional script or initialization path, depending on repository style.
- `computeReachablePairsAtLeastDistance(minStops)`
  - Internal helper used by `createGame`.

## Transactions

Route submission should be transactional:

1. Load and lock enough game state for the current SQLite transaction.
2. Refuse submission if the game is not owned by the user.
3. Refuse submission if the game is not in `planning`.
4. Validate the route.
5. If invalid, update the game as `invalid` or `expired` with score 0.
6. If valid, select events, insert game steps, update final score.
7. Commit.

SQLite does not use row-level locks like client-server databases, but a
transaction still prevents partial writes if route execution fails.

## Ranking Query Shape

```sql
SELECT
  u.id AS user_id,
  u.name,
  MAX(g.score) AS best_score,
  COUNT(g.id) AS completed_games
FROM users u
JOIN games g ON g.user_id = u.id
WHERE g.status IN ('executed', 'invalid', 'expired')
GROUP BY u.id, u.name
HAVING completed_games > 0
ORDER BY best_score DESC, u.name ASC;
```

If the implementation chooses to rank only valid successful routes, change the
`WHERE` clause to `g.status = 'executed'`. The recommended design ranks stored
scores, where invalid attempts have score 0.

## Initial Seed Data

Seed values should follow [Domain Model](./02-domain-model.md#proposed-seed-network):

- 14 stations.
- 5 lines.
- at least 3 interchange stations.
- 9 events.
- 3 users.
- historical games for 2 users with positive scores.
