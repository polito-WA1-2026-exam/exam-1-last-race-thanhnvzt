import { openDatabase } from '../../db/connection.js';

export async function listRanking() {
  const db = openDatabase();
  try {
    return await db.all(
      `SELECT
        u.id AS user_id,
        u.username,
        u.name,
        MAX(g.score) AS best_score,
        COUNT(g.id) AS completed_games
      FROM users u
      JOIN games g ON g.user_id = u.id
      WHERE g.status IN ('executed', 'invalid', 'expired')
      GROUP BY u.id, u.username, u.name
      ORDER BY best_score DESC, u.name ASC`,
    );
  } finally {
    await db.close();
  }
}
