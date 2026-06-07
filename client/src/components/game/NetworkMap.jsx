
export function NetworkMap({ stations, lines, height = 480 }) {
  return (
    <div className="network-map-container">
      <svg
        viewBox="0 0 720 480"
        className="metro-svg-map"
        width="100%"
        height={height}
      >
        {/* Draw Line Connections */}
        {lines.map((line) =>
          line.segments.map((seg) => {
            if (!seg.fromStation || !seg.toStation) return null;
            return (
              <line
                key={`${line.id}-${seg.id}`}
                x1={seg.fromStation.x}
                y1={seg.fromStation.y}
                x2={seg.toStation.x}
                y2={seg.toStation.y}
                stroke={line.color}
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          })
        )}

        {/* Draw Station Nodes */}
        {stations.map((station) => {
          const isInterchange = station.isInterchange;
          return (
            <g key={station.id} className="station-group">
              {isInterchange ? (
                <>
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r="11"
                    className="interchange-outer"
                  />
                  <circle
                    cx={station.x}
                    cy={station.y}
                    r="5"
                    className="interchange-inner"
                  />
                </>
              ) : (
                <circle
                  cx={station.x}
                  cy={station.y}
                  r="7.5"
                  className="standard-station"
                />
              )}

              {/* Station Label */}
              <text
                x={station.x}
                y={station.y - 14}
                textAnchor="middle"
                className={`station-label ${isInterchange ? 'interchange-label' : ''}`}
              >
                {station.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
