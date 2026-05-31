export function RankingTable({ ranking, currentUserId }) {
  return (
    <div className="ranking-table-wrap">
      <table className="ranking-table">
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Player</th>
            <th scope="col">Best score</th>
            <th scope="col">Completed games</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((row) => {
            const isCurrentUser = row.userId === currentUserId;

            return (
              <tr key={row.userId} className={isCurrentUser ? 'ranking-row-current' : undefined}>
                <td>
                  <strong>{row.position}</strong>
                </td>
                <td>
                  <div className="ranking-player-cell">
                    <span>{row.name}</span>
                    {isCurrentUser && <em>You</em>}
                  </div>
                </td>
                <td>{row.bestScore}</td>
                <td>{row.completedGames}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
