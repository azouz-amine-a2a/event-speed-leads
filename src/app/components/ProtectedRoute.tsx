import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, type UserRoleDisplay } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRoleDisplay[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        // Not authenticated, redirect to login
        navigate('/', { replace: true });
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User doesn't have the required role
        // Redirect to their default dashboard
        switch (user.role) {
          case 'staff':
            navigate('/staff', { replace: true });
            break;
          case 'owner':
            navigate('/owner', { replace: true });
            break;
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, loading, allowedRoles, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAFBFC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5CE1E6] mx-auto"></div>
          <p className="mt-4 text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or doesn't have required role
  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}