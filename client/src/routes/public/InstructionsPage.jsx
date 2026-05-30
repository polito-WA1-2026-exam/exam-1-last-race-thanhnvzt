import { Link } from 'react-router-dom';

export function InstructionsPage() {
  return (
    <section className="page-panel">
      <h1>Last Race</h1>
      <p>
        Study the underground network after login, then rebuild a valid route
        from memory before the 90-second timer ends.
      </p>
      <div className="placeholder-grid">
        <div className="placeholder-box">Setup: study the full network.</div>
        <div className="placeholder-box">Planning: select connected segments.</div>
        <div className="placeholder-box">Execution: watch events change coins.</div>
        <div className="placeholder-box">Ranking: compare best results.</div>
      </div>
      <p className="status-message">
        Only seeded registered users can play. The public page intentionally
        does not show the network map.
      </p>
      <p>
        <Link to="/login">Login to play</Link>
      </p>
    </section>
  );
}
