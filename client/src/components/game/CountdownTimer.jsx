import { useEffect, useRef, useState } from 'react';

function computeClientDeadlineMs(planningDeadline, serverNow, serverTimeSync) {
  //server actual time
  const serverNowMs = Date.parse(serverNow);
  // client's estimate clock
  const clientReferenceMs = serverTimeSync
    ? (serverTimeSync.requestStartedAtMs + serverTimeSync.responseReceivedAtMs) / 2
    : Date.now();
  // the clock difference
  const serverOffsetMs = serverNowMs - clientReferenceMs;
  return Date.parse(planningDeadline) - serverOffsetMs;
}

function computeRemainingMs(clientDeadlineMs) {
  return Math.max(0, clientDeadlineMs - Date.now());
}

function formatRemaining(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function CountdownTimer({
  planningDeadline,
  serverNow,
  serverTimeSync,
  forceExpired = false,
  onExpire,
}) {
  const [remainingMs, setRemainingMs] = useState(0);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const clientDeadlineMs = computeClientDeadlineMs(
      planningDeadline,
      serverNow,
      serverTimeSync,
    );
    expiredRef.current = false;

    function refreshRemaining() {
      if (forceExpired) {
        setRemainingMs(0);
        return;
      }

      const nextRemainingMs = computeRemainingMs(clientDeadlineMs);
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    }

    refreshRemaining();
    const intervalId = window.setInterval(refreshRemaining, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [forceExpired, planningDeadline, serverNow, serverTimeSync]);

  const isUrgent = remainingMs <= 10000;

  return (
    <div className={`countdown-card ${isUrgent ? 'countdown-card-urgent' : ''}`}>
      <span>Time left</span>
      <strong>{formatRemaining(remainingMs)}</strong>
    </div>
  );
}
