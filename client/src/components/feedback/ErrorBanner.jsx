export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <p className="error-message feedback-message" role="alert">
      {message}
    </p>
  );
}
