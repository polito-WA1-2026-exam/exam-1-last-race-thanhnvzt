import { useMemo, useRef, useState } from 'react';

function getSvgPoint(svgElement, event) {
  const point = svgElement.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svgElement.getScreenCTM().inverse());
}

export function StationOnlyMap({
  stations,
  segments = [],
  selectedSegmentIds = [],
  startStationId,
  destinationStationId,
  disabled = false,
  onConnectStations,
  height = 480,
}) {
  const svgRef = useRef(null);
  const stationsById = useMemo(
    () => new Map(stations.map((station) => [station.id, station])),
    [stations],
  );
  const selectedSegments = segments.filter((segment) =>
    selectedSegmentIds.includes(segment.id),
  );
  const [dragStartStationId, setDragStartStationId] = useState(null);
  const [previewPoint, setPreviewPoint] = useState(null);

  function handlePointerDown(event, stationId) {
    if (disabled) return;
    event.preventDefault();
    setDragStartStationId(stationId);
    setPreviewPoint(getSvgPoint(svgRef.current, event));
  }

  function handlePointerMove(event) {
    if (!dragStartStationId || disabled) return;
    setPreviewPoint(getSvgPoint(svgRef.current, event));
  }

  function handlePointerUp(event, stationId) {
    if (!dragStartStationId || disabled) return;
    event.preventDefault();

    if (stationId && stationId !== dragStartStationId) {
      onConnectStations?.(dragStartStationId, stationId);
    }

    setDragStartStationId(null);
    setPreviewPoint(null);
  }

  function handlePointerCancel() {
    setDragStartStationId(null);
    setPreviewPoint(null);
  }

  const dragStartStation = dragStartStationId
    ? stationsById.get(dragStartStationId)
    : null;

  return (
    <div className="station-only-map-container">
      <svg
        ref={svgRef}
        viewBox="0 0 720 480"
        className={`station-only-map ${disabled ? 'station-only-map-disabled' : ''}`}
        width="100%"
        height={height}
        aria-label="Station-only planning map"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
        onPointerLeave={handlePointerCancel}
      >
        {selectedSegments.map((segment, index) => {
          const stationA = stationsById.get(segment.stationA.id);
          const stationB = stationsById.get(segment.stationB.id);
          if (!stationA || !stationB) return null;

          return (
            <line
              key={`${segment.id}-${index}`}
              x1={stationA.x}
              y1={stationA.y}
              x2={stationB.x}
              y2={stationB.y}
              className="selected-planning-link"
            />
          );
        })}

        {dragStartStation && previewPoint && (
          <line
            x1={dragStartStation.x}
            y1={dragStartStation.y}
            x2={previewPoint.x}
            y2={previewPoint.y}
            className="planning-drag-preview"
          />
        )}

        {stations.map((station) => {
          const isStart = station.id === startStationId;
          const isDestination = station.id === destinationStationId;
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
            <g
              key={station.id}
              className="planning-station-group"
              onPointerDown={(event) => handlePointerDown(event, station.id)}
              onPointerUp={(event) => handlePointerUp(event, station.id)}
            >
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
    </div>
  );
}
