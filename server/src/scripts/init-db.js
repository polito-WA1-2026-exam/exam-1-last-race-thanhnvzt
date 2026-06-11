import { scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { openDatabase } from '../db/connection.js';
import { createSchemaSql, dropSchemaSql } from '../db/schema.js';
import {
  seedEvents,
  seedHistoricalGames,
  seedLines,
  seedStations,
  seedUsers,
} from '../db/seedData.js';

const scryptAsync = promisify(scrypt);

async function hashPassword(password, salt) {
  const hash = await scryptAsync(password, salt, 64);
  return hash.toString('hex');
}

function segmentKey(stationAId, stationBId) {
  return [Math.min(stationAId, stationBId), Math.max(stationAId, stationBId)].join(':');
}

async function seedDatabase() {
  const db = openDatabase();

  try {
    await db.exec('PRAGMA foreign_keys = OFF;');
    await db.exec(dropSchemaSql);
    await db.exec(createSchemaSql);
    await db.exec('PRAGMA foreign_keys = ON;');

    const userIdsByUsername = new Map();
    for (const user of seedUsers) {
      const passwordHash = await hashPassword(user.password, user.salt);
      const result = await db.run(
        'INSERT INTO users (username, name, password_hash, salt) VALUES (?, ?, ?, ?)',
        [user.username, user.name, passwordHash, user.salt],
      );
      userIdsByUsername.set(user.username, result.lastID);
    }

    const stationIdsByName = new Map();
    for (const station of seedStations) {
      const result = await db.run(
        'INSERT INTO stations (name, x, y) VALUES (?, ?, ?)',
        [station.name, station.x, station.y],
      );
      stationIdsByName.set(station.name, result.lastID);
    }

    const lineIdsByName = new Map();
    const segmentIdsByKey = new Map();
    for (const line of seedLines) {
      const lineResult = await db.run('INSERT INTO metro_lines (name, color) VALUES (?, ?)', [
        line.name,
        line.color,
      ]);
      lineIdsByName.set(line.name, lineResult.lastID);

      for (let index = 0; index < line.stations.length - 1; index += 1) {
        const fromStationId = stationIdsByName.get(line.stations[index]);
        const toStationId = stationIdsByName.get(line.stations[index + 1]);
        const stationAId = Math.min(fromStationId, toStationId);
        const stationBId = Math.max(fromStationId, toStationId);
        const key = segmentKey(fromStationId, toStationId);

        let segmentId = segmentIdsByKey.get(key);
        if (!segmentId) {
          const segmentResult = await db.run(
            'INSERT INTO segments (station_a_id, station_b_id) VALUES (?, ?)',
            [stationAId, stationBId],
          );
          segmentId = segmentResult.lastID;
          segmentIdsByKey.set(key, segmentId);
        }

        await db.run(
          'INSERT INTO line_segments (line_id, segment_id, position) VALUES (?, ?, ?)',
          [lineResult.lastID, segmentId, index],
        );
      }
    }

    const eventIdsByDescription = new Map();
    for (const event of seedEvents) {
      const result = await db.run('INSERT INTO events (description, effect) VALUES (?, ?)', [
        event.description,
        event.effect,
      ]);
      eventIdsByDescription.set(event.description, result.lastID);
    }

    for (const game of seedHistoricalGames) {
      const gameResult = await db.run(
        `INSERT INTO games (
          user_id,
          status,
          start_station_id,
          destination_station_id,
          started_at,
          planning_deadline,
          submitted_at,
          initial_coins,
          final_coins,
          score,
          valid_route
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userIdsByUsername.get(game.username),
          game.status,
          stationIdsByName.get(game.start),
          stationIdsByName.get(game.destination),
          game.startedAt,
          game.planningDeadline,
          game.submittedAt,
          20,
          game.finalCoins,
          game.score,
          1,
        ],
      );

      for (let index = 0; index < game.steps.length; index += 1) {
        const step = game.steps[index];
        await db.run(
          `INSERT INTO game_steps (
            game_id,
            step_index,
            from_station_id,
            to_station_id,
            line_id,
            event_id,
            coins_after_step
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            gameResult.lastID,
            index,
            stationIdsByName.get(step.from),
            stationIdsByName.get(step.to),
            lineIdsByName.get(step.line),
            eventIdsByDescription.get(step.event),
            step.coinsAfterStep,
          ],
        );
      }
    }

    const summary = {
      users: await db.get('SELECT COUNT(*) AS count FROM users'),
      stations: await db.get('SELECT COUNT(*) AS count FROM stations'),
      lines: await db.get('SELECT COUNT(*) AS count FROM metro_lines'),
      segments: await db.get('SELECT COUNT(*) AS count FROM segments'),
      interchanges: await db.get(
        `SELECT COUNT(*) AS count
        FROM (
          SELECT served.station_id
          FROM (
            SELECT s.station_a_id AS station_id, ls.line_id
            FROM segments s
            JOIN line_segments ls ON ls.segment_id = s.id
            UNION
            SELECT s.station_b_id AS station_id, ls.line_id
            FROM segments s
            JOIN line_segments ls ON ls.segment_id = s.id
          ) served
          GROUP BY served.station_id
          HAVING COUNT(DISTINCT served.line_id) > 1
        )`,
      ),
      events: await db.get('SELECT COUNT(*) AS count FROM events'),
      successfulHistoricalGames: await db.get(
        "SELECT COUNT(*) AS count FROM games WHERE status = 'executed' AND valid_route = 1 AND score > 0",
      ),
    };

    console.log('Database initialized:', {
      users: summary.users.count,
      stations: summary.stations.count,
      lines: summary.lines.count,
      segments: summary.segments.count,
      interchanges: summary.interchanges.count,
      events: summary.events.count,
      successfulHistoricalGames: summary.successfulHistoricalGames.count,
    });
  } finally {
    await db.close();
  }
}

seedDatabase().catch((err) => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});
