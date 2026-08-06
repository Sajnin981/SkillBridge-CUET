import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/lib/types';

interface ProtectedRouteProps {
  role: Role;
  children: React.ReactNode;
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={authService_dashboardPath(user.role)} replace />;
  }

  return <>{children}</>;
}

function authService_dashboardPath(role: Role) {
  return `/${role}`;
}
