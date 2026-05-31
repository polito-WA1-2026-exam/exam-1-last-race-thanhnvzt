import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as authApi from '../../api/authApi.js';
import { useAuth } from '../../context/useAuth.js';
import { SubmitButton } from '../../components/controls/SubmitButton.jsx';
import { ErrorBanner } from '../../components/feedback/ErrorBanner.jsx';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await authApi.login({ username, password });
      setUser(user);
      navigate(location.state?.from?.pathname || '/setup', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-panel">
      <h1>Login</h1>
      <form className="form-stack" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <SubmitButton isSubmitting={submitting} loadingLabel="Logging in...">
          Login
        </SubmitButton>
      </form>
      <ErrorBanner message={error} />
    </section>
  );
}
