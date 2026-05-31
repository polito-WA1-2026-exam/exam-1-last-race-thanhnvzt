export function LoadingPanel({ message = 'Loading...' }) {
  return (
    <section className="page-panel feedback-panel" aria-busy="true">
      <p className="status-message feedback-message" role="status">
        {message}
      </p>
    </section>
  );
}
