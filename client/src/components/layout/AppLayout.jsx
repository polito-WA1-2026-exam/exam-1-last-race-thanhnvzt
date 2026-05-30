import { Outlet } from 'react-router-dom';
import { TopNav } from './TopNav.jsx';

export function AppLayout() {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
