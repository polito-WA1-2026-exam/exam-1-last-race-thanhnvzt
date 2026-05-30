import { useState } from 'react';

const MAP_WIDTH = 720;
const MAP_HEIGHT = 480;

function formatEffect(effect) {
  if (effect > 0) return `+${effect}`;
  return String(effect);
}

function midpoint(step) {
  return {
    x: (step.fromStation.x + step.toStation.x) / 2,
    y: (step.fromStation.y + step.toStation.y) / 2,
  };
}

function buildStations(result) {
  if (result.stations?.length > 0) return result.stations;

  const stationsById = new Map();
  for (const step of result.steps || []) {
    stationsById.set(step.fromStation.id, step.fromStation);
    stationsById.set(step.toStation.id, step.toStation);
  }
  return [...stationsById.values()];
}

function popupStyle(point) {
  const leftPercent = (point.x / MAP_WIDTH) * 100;
  const topPercent = (point.y / MAP_HEIGHT) * 100;
  const verticalOffset = point.y < 120 ? '20px' : '-18px';

  return {
    left: `clamp(120px, ${leftPercent}%, calc(100% - 120px))`,
    top: `${topPercent}%`,
    transform: `translate(-50%, ${verticalOffset})`,
  };
}

export function ResultRouteMap({ result, visibleStepCount }) {
  const [hoveredStepIndex, setHoveredStepIndex] = useState(null);
  const stations = buildStations(result);
  const visibleSteps = result.steps.slice(0, visibleStepCount);
  const activeStep = visibleSteps[visibleSteps.length - 1] || null;
  const hoveredStep = visibleSteps.find((step) => step.index === hoveredStepIndex);
  const popupStep = hoveredStep || activeStep;

  return (
    <div className="result-route-map-stage">
      <svg
        className="station-only-map result-route-map"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        width="100%"
        height="100%"
        role="img"
        aria-label="Result route map"
      >
        {visibleSteps.map((step) => {
          const point = midpoint(step);
          const isActive = step.index === activeStep?.index;

          return (
            <g
              key={step.index}
              className="result-route-step"
              tabIndex="0"
              onMouseEnter={() => setHoveredStepIndex(step.index)}
              onMouseLeave={() => setHoveredStepIndex(null)}
              onFocus={() => setHoveredStepIndex(step.index)}
              onBlur={() => setHoveredStepIndex(null)}
              aria-label={`Step ${step.index + 1}: ${step.event.description}, ${formatEffect(step.event.effect)} coins`}
            >
              <line
                x1={step.fromStation.x}
                y1={step.fromStation.y}
                x2={step.toStation.x}
                y2={step.toStation.y}
                className={isActive ? 'result-route-edge result-route-edge-active' : 'result-route-edge'}
                stroke={step.line.color}
              />
              <text
                x={point.x}
                y={point.y - 12}
                textAnchor="middle"
                dominantBaseline="middle"
                className={step.event.effect >= 0 ? 'result-edge-effect coin-positive' : 'result-edge-effect coin-negative'}
              >
                {formatEffect(step.event.effect)}
              </text>
            </g>
          );
        })}

        {stations.map((station) => {
          const isStart = station.id === result.startStation?.id;
          const isDestination = station.id === result.destinationStation?.id;
          const markerClassName = [
            'planning-station',
            isStart ? 'planning-station-start' : '',
            isDestination ? 'planning-station-destination' : '',
          ]
            .filter(Boolean)
            .join(' ');
          const labelClassName = [
            'planning-station-label',
            isStart ? 'planning-station-label-start' : '',
            isDestination ? 'planning-station-label-destination' : '',
          ]
            .filter(Boolean)
            .join(' ');
          const label = isStart
            ? `Start: ${station.name}`
            : isDestination
              ? `Destination: ${station.name}`
              : station.name;
          const labelOffset = isStart || isDestination ? 20 : 16;

          return (
            <g key={station.id}>
              <circle
                cx={station.x}
                cy={station.y}
                r={isStart || isDestination ? 12 : 8}
                className={markerClassName}
              />
              <text
                x={station.x}
                y={station.y - labelOffset}
                textAnchor="middle"
                className={labelClassName}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {popupStep && (
        <div className="result-event-popover" style={popupStyle(midpoint(popupStep))}>
          <span>{popupStep.line.name}</span>
          <strong>{popupStep.event.description}</strong>
          <em className={popupStep.event.effect >= 0 ? 'coin-positive' : 'coin-negative'}>
            {formatEffect(popupStep.event.effect)}
          </em>
        </div>
      )}
    </div>
  );
}
