import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';

const gameSteps = [
  'Log in and study the complete network before the timer starts.',
  'Start a game to receive a random start and destination from the server.',
  'Build a route from segment pairs within 90 seconds.',
  'Submit manually, or let timeout submit the route built so far.',
  'Watch valid routes resolve step by step with random coin events.',
];

const ruleCards = [
  {
    label: 'Timer',
    value: '90s',
    text: 'Planning ends automatically at zero.',
  },
  {
    label: 'Route',
    value: 'Valid',
    text: 'Start, destination, continuity, and interchanges all matter.',
  },
  {
    label: 'Score',
    value: '20',
    text: 'Every game starts with 20 coins; invalid routes score zero.',
  },
];

export function InstructionsPage() {
  const { user } = useAuth();

  return (
    <section className="instructions-page">
      <div className="instructions-hero">
        <div className="instructions-copy">
          <p className="eyebrow">Route memory challenge</p>
          <h1>Last Race</h1>
          <p className="lead">
            Study a hidden transit network after login, then rebuild a valid
            route from memory before the planning timer expires.
          </p>
          <div className="instruction-actions">
            {user ? (
              <Link className="primary-button" to="/setup">
                Go to setup
              </Link>
            ) : (
              <Link className="primary-button" to="/login">
                Login to play
              </Link>
            )}
          </div>
        </div>

        <div className="signal-board" aria-label="Game rule summary">
          <div className="signal-board-header">
            <span>Planning window</span>
            <strong>90 seconds</strong>
          </div>
          <div className="signal-track" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>
            Timeout submits the route already selected. No extra editing happens
            after the visible timer reaches zero.
          </p>
        </div>
      </div>

      <div className="rule-card-grid">
        {ruleCards.map((card) => (
          <article className="rule-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.text}</p>
          </article>
        ))}
      </div>

      <div className="instructions-grid">
        <section className="instruction-panel">
          <h2>How a game works</h2>
          <ol className="instruction-steps">
            {gameSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </section>
  );
}
