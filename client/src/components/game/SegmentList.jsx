export function SegmentList({
  segments,
  selectedSegmentIds = [],
  disabled = false,
  onToggleSegment,
}) {
  return (
    <aside className="segment-list-panel">
      <div className="segment-list-header">
        <div>
          <h2>Segment pairs</h2>
          <p className="status-message">
            Click a pair to add it. Click it again to remove it from the map.
          </p>
        </div>
        <strong>{selectedSegmentIds.length}</strong>
      </div>

      <div className="segment-list">
        {segments.map((segment) => {
          const isSelected = selectedSegmentIds.includes(segment.id);
          return (
            <button
              className={`segment-row ${isSelected ? 'segment-row-selected' : ''}`}
              key={segment.id}
              type="button"
              onClick={() => onToggleSegment(segment.id)}
              disabled={disabled}
            >
              <span>{segment.stationA.name}</span>
              <span aria-hidden="true">-</span>
              <span>{segment.stationB.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
