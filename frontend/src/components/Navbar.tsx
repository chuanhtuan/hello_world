import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    // logout() never rejects (see AuthContext) - local state is always
    // cleared, so it's always safe to navigate away afterwards.
    await logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">HelloWorld</Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            {user.role === 'ADMIN' && <Link to="/users">Users</Link>}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
