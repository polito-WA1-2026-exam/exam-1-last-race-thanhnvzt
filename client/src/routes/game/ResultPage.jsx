import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as gameApi from '../../api/gameApi.js';
import { SubmitButton } from '../../components/controls/SubmitButton.jsx';
import { ExecutionTimeline } from '../../components/game/ExecutionTimeline.jsx';
import { ResultRouteMap } from '../../components/game/ResultRouteMap.jsx';
import { ScorePanel } from '../../components/game/ScorePanel.jsx';
import { ErrorBanner } from '../../components/feedback/ErrorBanner.jsx';
import { LoadingPanel } from '../../components/feedback/LoadingPanel.jsx';

function InvalidResultPanel({ result }) {
  return (
    <section className="segment-list-panel result-invalid-panel">
      <div className="segment-list-header">
        <div>
          <h2>Route failed</h2>
          <p className="status-message">The route cannot be executed.</p>
        </div>
        <strong>0</strong>
      </div>
      <div className="result-invalid-body">
        <h3>{result.status === 'expired' ? 'Planning time expired' : 'Invalid route'}</h3>
        <p>{result.invalidReason || 'The submitted route does not satisfy the route rules.'}</p>
      </div>
    </section>
  );
}

export function ResultPage() {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(location.state?.result || null);
  const [visibleStepCount, setVisibleStepCount] = useState(0);
  const [loading, setLoading] = useState(!location.state?.result);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result) return undefined;
    let ignore = false;

    async function loadResult() {
      try {
        setLoading(true);
        const data = await gameApi.getGameResult(gameId);
        if (!ignore) {
          setResult(data);
          setVisibleStepCount(0);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load result.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadResult();

    return () => {
      ignore = true;
    };
  }, [gameId, result]);

  useEffect(() => {
    if (!result?.validRoute || visibleStepCount >= result.steps.length) return undefined;

    const timeoutId = window.setTimeout(() => {
      setVisibleStepCount((current) => Math.min(current + 1, result.steps.length));
    }, 950);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [result, visibleStepCount]);

  const activeStep = result?.steps?.[Math.max(visibleStepCount - 1, 0)] || null;
  const currentCoins = useMemo(() => {
    if (!result) return 0;
    if (!result.validRoute) return result.finalCoins ?? 0;
    return activeStep ? activeStep.coinsAfterStep : result.initialCoins;
  }, [activeStep, result]);
  const playbackComplete = result?.validRoute
    ? visibleStepCount >= result.steps.length
    : true;

  if (loading) {
    return <LoadingPanel message="Loading result..." />;
  }

  if (error) {
    return (
      <section className="page-panel">
        <h1>Result Error</h1>
        <ErrorBanner message={error} />
      </section>
    );
  }

  return (
    <section className="page-panel planning-page result-game-page">
      <div className="planning-header">
        <div>
          <p className="eyebrow">Game #{result.gameId}</p>
          <h1>{result.validRoute ? 'Route result' : 'Route failed'}</h1>
        </div>
      </div>

      <div className="planning-action-bar result-action-bar">
        <ScorePanel
          result={result}
          visibleStepCount={visibleStepCount}
          currentCoins={currentCoins}
          activeStep={activeStep}
        />
        <div className="planning-action-controls">
          {result.validRoute && !playbackComplete && (
            <button type="button" onClick={() => setVisibleStepCount(result.steps.length)}>
              Show all
            </button>
          )}
          <SubmitButton type="button" onClick={() => navigate('/setup')}>
            New game
          </SubmitButton>
          <Link to="/ranking">Ranking</Link>
        </div>
      </div>

      <div className="planning-layout result-layout">
        <div className="planning-map-panel result-map-panel">
          {result.validRoute ? (
            <ResultRouteMap result={result} visibleStepCount={visibleStepCount} />
          ) : (
            <div className="result-map-announcement">
              <h2>{result.status === 'expired' ? 'Time is over' : 'Invalid route'}</h2>
              <p>{result.invalidReason || 'No route animation is available.'}</p>
            </div>
          )}
        </div>

        {result.validRoute ? (
          <ExecutionTimeline steps={result.steps} visibleStepCount={visibleStepCount} />
        ) : (
          <InvalidResultPanel result={result} />
        )}
      </div>
    </section>
  );
}
