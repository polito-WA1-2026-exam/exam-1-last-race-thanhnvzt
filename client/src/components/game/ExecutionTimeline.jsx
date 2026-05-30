function formatEffect(effect) {
  if (effect > 0) return `+${effect}`;
  return String(effect);
}

export function ExecutionTimeline({ steps, visibleStepCount }) {
  const visibleSteps = steps.slice(0, visibleStepCount);

  return (
    <section className="segment-list-panel result-event-panel">
      <div className="segment-list-header">
        <div>
          <h2>Journey events</h2>
          <p className="status-message">Events are revealed in route order.</p>
        </div>
        <strong>{visibleSteps.length}</strong>
      </div>
      <ol className="result-event-list">
        {visibleSteps.length === 0 && (
          <li className="result-event-empty">Preparing route playback...</li>
        )}
        {visibleSteps.map((step) => (
          <li key={step.index} className="result-event-row">
            <div className="result-event-index">{step.index + 1}</div>
            <div className="result-event-body">
              <div className="result-event-route">
                <strong>{step.fromStation.name}</strong>
                <span>to</span>
                <strong>{step.toStation.name}</strong>
              </div>
              <div className="result-event-line">
                <span
                  className="line-swatch"
                  style={{ backgroundColor: step.line.color }}
                  aria-hidden="true"
                />
                <span>{step.line.name}</span>
              </div>
              <p>
                {step.event.description}
                <strong className={step.event.effect >= 0 ? 'coin-positive' : 'coin-negative'}>
                  {formatEffect(step.event.effect)}
                </strong>
              </p>
            </div>
            <div className="step-coins">{step.coinsAfterStep}</div>
          </li>
        ))}
      </ol>
    </section>
  );
}
