import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center font-mono text-sm text-slate">
        Checking your session…
      </div>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
