import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import * as authApi from '../../api/authApi.js';

export function TopNav() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await authApi.logout().catch(() => {});
    setUser(null);
    navigate('/');
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
            <button className="link-button" type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </nav>
    </header>
  );
}
