
import { useSupabase } from '@/lib/providers/supabase-provider';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useSupabase();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    // Redirect to home page with the current location in state
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
