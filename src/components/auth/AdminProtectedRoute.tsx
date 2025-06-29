import { useSupabase } from '@/lib/providers/supabase-context';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { AuthenticatedApp } from '@/components/auth/AuthenticatedApp';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, loading } = useSupabase();
  const location = useLocation();

  // Admin email - only this user can access protected admin routes
  const ADMIN_EMAIL = 'max@aiwithapex.com';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Check if user is authenticated and has the admin email
  if (!user || user.email !== ADMIN_EMAIL) {
    // Redirect to home page with the current location in state
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <AuthenticatedApp>{children}</AuthenticatedApp>;
}