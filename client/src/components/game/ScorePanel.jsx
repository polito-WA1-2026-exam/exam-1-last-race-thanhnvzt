function formatEffect(effect) {
  if (effect > 0) return `+${effect}`;
  return String(effect);
}

export function ScorePanel({ result, visibleStepCount, currentCoins, activeStep }) {
  return (
    <>
      <div>
        <span>Coins</span>
        <strong>{currentCoins}</strong>
      </div>
      <div>
        <span>Status</span>
        <strong>{result.status}</strong>
      </div>
      {result.validRoute && (
        <div>
          <span>Journey steps</span>
          <strong>
            {visibleStepCount}/{result.steps.length}
          </strong>
        </div>
      )}
      {activeStep && (
        <div className="result-current-event">
          <span>Current event</span>
          <strong>
            Step {activeStep.index + 1}: {activeStep.fromStation.name} to {activeStep.toStation.name}
          </strong>
          <p>
            {activeStep.event.description}
            <em className={activeStep.event.effect >= 0 ? 'coin-positive' : 'coin-negative'}>
              {formatEffect(activeStep.event.effect)}
            </em>
          </p>
        </div>
      )}
      <div>
        <span>Final score</span>
        <strong>{result.validRoute && visibleStepCount < result.steps.length ? '-' : result.score}</strong>
      </div>
    </>
  );
}
