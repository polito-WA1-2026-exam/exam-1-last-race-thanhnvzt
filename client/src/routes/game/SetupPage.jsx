import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as gameApi from '../../api/gameApi.js';
import { SubmitButton } from '../../components/controls/SubmitButton.jsx';
import { NetworkMap } from '../../components/game/NetworkMap.jsx';
import { LoadingPanel } from '../../components/feedback/LoadingPanel.jsx';
import { ErrorBanner } from '../../components/feedback/ErrorBanner.jsx';

export function SetupPage() {
  const navigate = useNavigate();
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startError, setStartError] = useState(null);
  const [startingGame, setStartingGame] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadNetwork() {
      try {
        setLoading(true);
        const data = await gameApi.getSetupNetwork();
        if (!ignore) {
          setNetwork(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to fetch network map.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadNetwork();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleStartGame() {
    try {
      setStartingGame(true);
      setStartError(null);
      const game = await gameApi.createGame();
      navigate(`/game/${game.gameId}/planning`);
    } catch (err) {
      setStartError(err.message || 'Failed to start game.');
    } finally {
      setStartingGame(false);
    }
  }

  if (loading) {
    return <LoadingPanel message="Loading underground network..." />;
  }

  if (error) {
    return (
      <section className="page-panel">
        <h1>Network Error</h1>
        <ErrorBanner message={error} />
      </section>
    );
  }

  return (
    <section className="page-panel setup-page">
      <div className="setup-header">
        <h1>Underground Network</h1>
        <p className="status-message">
          Study the metro network layout, stations, and connections before starting the challenge.
        </p>
      </div>

      <div className="setup-layout">
        <div className="setup-main">
          {network && (
            <NetworkMap stations={network.stations} lines={network.lines} />
          )}
        </div>

        <div className="setup-sidebar">
          <div className="sidebar-panel">
            <h2>Metro Lines</h2>
            <div className="legend-list">
              {network?.lines.map((line) => (
                <div className="legend-item" key={line.id}>
                  <div
                    className="legend-indicator"
                    style={{ backgroundColor: line.color }}
                  />
                  <span className="legend-name">{line.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-panel">
            <h2>Challenge Rules</h2>
            <ul className="rule-reminder-list">
              <li>You will receive a random starting station and destination.</li>
              <li>A minimum distance of at least 3 stops is guaranteed.</li>
              <li>You have 90 seconds to rebuild the route using segment pairs.</li>
              <li>Line changes are only allowed at interchange stations (highlighted white).</li>
              <li>Valid routes earn coins through random transit events.</li>
            </ul>
          </div>

          <SubmitButton
            className="setup-start-button"
            type="button"
            onClick={handleStartGame}
            isSubmitting={startingGame}
            loadingLabel="Starting..."
          >
            Start Challenge
          </SubmitButton>
          <ErrorBanner message={startError} />
        </div>
      </div>
    </section>
  );
}
