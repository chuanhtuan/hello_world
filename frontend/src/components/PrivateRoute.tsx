import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page">Loading...</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'ADMIN' ? <Outlet /> : <Navigate to="/profile" replace />;
}
