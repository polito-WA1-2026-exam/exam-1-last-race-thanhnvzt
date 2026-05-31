import { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate, useParams } from 'react-router-dom';
import * as gameApi from '../../api/gameApi.js';
import { SubmitButton } from '../../components/controls/SubmitButton.jsx';
import { CountdownTimer } from '../../components/game/CountdownTimer.jsx';
import { SegmentList } from '../../components/game/SegmentList.jsx';
import { StationOnlyMap } from '../../components/game/StationOnlyMap.jsx';
import { ErrorBanner } from '../../components/feedback/ErrorBanner.jsx';
import { LoadingPanel } from '../../components/feedback/LoadingPanel.jsx';

export function PlanningPage() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const [planningData, setPlanningData] = useState(null);
  const [selectedSegmentIds, setSelectedSegmentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routeWarning, setRouteWarning] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitNotice, setSubmitNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expired, setExpired] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadPlanningData() {
      try {
        setLoading(true);
        const data = await gameApi.getPlanningData(gameId);
        if (!ignore) {
          setPlanningData(data);
          setSelectedSegmentIds([]);
          setRouteWarning(null);
          setSubmitError(null);
          setSubmitNotice(null);
          setSubmitted(false);
          setExpired(false);
          setShowSubmitConfirm(false);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load planning data.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadPlanningData();

    return () => {
      ignore = true;
    };
  }, [gameId]);

  useEffect(() => {
    if (!routeWarning) return undefined;

    const timeoutId = window.setTimeout(() => {
      setRouteWarning(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [routeWarning]);

  const editingDisabled = expired || submitting || submitted;

  const toggleSegment = useCallback(
    (segmentId) => {
      if (editingDisabled) return;
      setSubmitError(null);
      setSubmitNotice(null);

      setSelectedSegmentIds((currentIds) => {
        if (currentIds.includes(segmentId)) {
          setRouteWarning(null);
          return currentIds.filter((id) => id !== segmentId);
        }

        setRouteWarning(null);
        return [...currentIds, segmentId];
      });
    },
    [editingDisabled],
  );

  function findSegmentBetweenStations(fromStationId, toStationId) {
    return planningData.segments.find(
      (segment) =>
        (segment.stationA.id === fromStationId &&
          segment.stationB.id === toStationId) ||
        (segment.stationA.id === toStationId &&
          segment.stationB.id === fromStationId),
    );
  }

  function handleConnectStations(fromStationId, toStationId) {
    if (editingDisabled) return;

    const segment = findSegmentBetweenStations(fromStationId, toStationId);
    if (!segment) {
      setRouteWarning('Those stations do not form a direct segment.');
      return;
    }

    toggleSegment(segment.id);
  }

  function handleClearRoute() {
    setSelectedSegmentIds([]);
    setRouteWarning(null);
    setSubmitError(null);
    setSubmitNotice(null);
    setShowSubmitConfirm(false);
  }

  const handleSubmitRoute = useCallback(
    async ({ triggeredByTimeout = false } = {}) => {
      if (submitted || submitting) return;

      if (expired && !triggeredByTimeout) {
        setSubmitError('Planning time is over. The route can no longer be edited or submitted manually.');
        return;
      }

      if (selectedSegmentIds.length === 0 && !triggeredByTimeout) {
        setSubmitError('Select at least one segment before submitting manually.');
        return;
      }

      try {
        setSubmitting(true);
        setSubmitted(true);
        setExpired(true);
        setShowSubmitConfirm(false);
        setSubmitError(null);
        setSubmitNotice(
          triggeredByTimeout
            ? 'Time is over. Submitting the current route...'
            : 'Submitting route...',
        );

        const result = await gameApi.submitRoute(gameId, selectedSegmentIds);
        navigate(`/game/${gameId}/result`, { state: { result } });
      } catch (err) {
        if (err.status === 501) {
          setSubmitNotice(null);
          setSubmitError(null);
        } else {
          setSubmitNotice(null);
          setSubmitted(false);
          setExpired(false);
          setSubmitError(err.message || 'Failed to submit route.');
        }
      } finally {
        setSubmitting(false);
      }
    },
    [expired, gameId, navigate, selectedSegmentIds, submitted, submitting],
  );

  function handleRequestSubmitRoute() {
    if (editingDisabled) return;

    setSubmitError(null);
    setSubmitNotice(null);

    if (selectedSegmentIds.length === 0) {
      setSubmitError('Select at least one segment before submitting manually.');
      return;
    }

    setShowSubmitConfirm(true);
  }

  function handleCloseSubmitConfirm() {
    if (submitting) return;
    setShowSubmitConfirm(false);
  }

  function handleConfirmSubmitRoute() {
    handleSubmitRoute();
  }

  const handleTimerExpire = useCallback(() => {
    setShowSubmitConfirm(false);
    setExpired(true);
    handleSubmitRoute({ triggeredByTimeout: true });
  }, [handleSubmitRoute]);

  if (loading) {
    return <LoadingPanel message="Loading planning board..." />;
  }

  if (error) {
    return (
      <section className="page-panel">
        <h1>Planning Error</h1>
        <ErrorBanner message={error} />
      </section>
    );
  }

  return (
    <section className="page-panel planning-page">
      <div className="planning-header">
        <div>
          <p className="eyebrow">Planning game #{planningData.gameId}</p>
          <h1>Build your route</h1>
        </div>
      </div>

      <div className="planning-action-bar">
        <div>
          <span>Coins</span>
          <strong>{planningData.initialCoins}</strong>
        </div>
        <div>
          <span>Selected segments</span>
          <strong>{selectedSegmentIds.length}</strong>
        </div>
        <CountdownTimer
          planningDeadline={planningData.planningDeadline}
          serverNow={planningData.serverNow}
          forceExpired={submitted}
          onExpire={handleTimerExpire}
        />
        <div className="planning-action-controls">
          <button
            type="button"
            onClick={handleClearRoute}
            disabled={editingDisabled || selectedSegmentIds.length === 0}
          >
            Clear
          </button>
          <SubmitButton
            type="button"
            onClick={handleRequestSubmitRoute}
            disabled={editingDisabled || selectedSegmentIds.length === 0}
            isSubmitting={submitting}
          >
            Submit
          </SubmitButton>
        </div>
        {(submitNotice || submitError) && (
          <p className={submitError ? 'error-message' : 'status-message'}>
            {submitError || submitNotice}
          </p>
        )}
      </div>

      <div className="planning-layout">
        <div className="planning-map-panel">
          <StationOnlyMap
            stations={planningData.stations}
            segments={planningData.segments}
            selectedSegmentIds={selectedSegmentIds}
            startStationId={planningData.startStation.id}
            destinationStationId={planningData.destinationStation.id}
            disabled={editingDisabled}
            onConnectStations={handleConnectStations}
            height="100%"
          />
          {routeWarning && (
            <p className="route-warning" role="status">
              {routeWarning}
            </p>
          )}
        </div>

        <SegmentList
          segments={planningData.segments}
          selectedSegmentIds={selectedSegmentIds}
          disabled={editingDisabled}
          onToggleSegment={toggleSegment}
        />
      </div>

      <Modal
        show={showSubmitConfirm}
        onHide={handleCloseSubmitConfirm}
        centered
        backdrop="static"
        className="route-confirm-modal"
      >
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>Submit route?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Submit the selected route before the timer expires. After
            submission, the route cannot be changed.
          </p>
          <div className="route-confirm-summary">
            <span>Selected segments</span>
            <strong>{selectedSegmentIds.length}</strong>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={handleCloseSubmitConfirm}
            disabled={submitting}
          >
            Keep editing
          </Button>
          <SubmitButton
            type="button"
            onClick={handleConfirmSubmitRoute}
            isSubmitting={submitting}
          >
            Submit
          </SubmitButton>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
