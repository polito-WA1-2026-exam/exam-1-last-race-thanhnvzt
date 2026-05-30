import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="page-panel">
      <h1>Page not found</h1>
      <p>The requested page is not part of the Last Race app.</p>
      <p>
        <Link to="/">Back to instructions</Link>
      </p>
    </section>
  );
}
