import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      <header className="navbar">
        <span className="brand">Sweety</span>
        <nav>
          <Link to="/readings">Readings</Link>
          <Link to="/reports">Reports</Link>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
        {user && <span className="who">{user.name}</span>}
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
