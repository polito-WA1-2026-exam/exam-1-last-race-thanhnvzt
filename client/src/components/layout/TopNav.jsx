import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import * as authApi from '../../api/authApi.js';
import { LogoutModal } from './LogoutModal.jsx';
import { useState } from 'react';

export function TopNav() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [showLogout, setShowLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const onHideLogout = () => setShowLogout(false);
  const onShowLogout = () => setShowLogout(true);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // The server may already have dropped the in-memory session.
    } finally {
      setShowLogout(false);
      setLoggingOut(false);
      setUser(null);
      navigate('/');
    }
  }

  return (
    <header className="top-nav">
      <Link className="brand-link" to="/">
        Last Race
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        <NavLink to="/" end>Home</NavLink>
        {user ? (
          <>
            <NavLink to="/setup">Setup</NavLink>
            <NavLink to="/ranking">Ranking</NavLink>
            <span>{user.name}</span>
            <button className="link-button" type="button" onClick={onShowLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </nav>
      <LogoutModal
        show={showLogout}
        onHide={onHideLogout}
        onConfirm={handleLogout}
        loggingOut={loggingOut}
      />
    </header>

  );
}
