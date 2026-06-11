export function mapRanking(rows) {
  return rows.map((row, index) => ({
    position: index + 1,
    userId: row.user_id,
    username: row.username,
    name: row.name,
    bestScore: row.best_score,
    completedGames: row.completed_games,
  }));
}
