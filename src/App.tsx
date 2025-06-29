// Built with Bolt.new
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { QueryProvider } from '@/lib/providers/query-provider';
import { SupabaseProvider } from '@/lib/providers/supabase-provider';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminProtectedRoute } from '@/components/auth/AdminProtectedRoute';
import { useHealthMonitoring } from '@/hooks/use-health-monitoring';
import { useEnergyRegeneration } from '@/hooks/use-energy-regeneration';
import { Spinner } from '@/components/ui/spinner';

// Lazy load page components for code splitting
const Home = lazy(() => import('@/pages/Home').then(module => ({ default: module.Home })));
const Adventure = lazy(() => import('@/pages/Adventure').then(module => ({ default: module.Adventure })));
const Progress = lazy(() => import('@/pages/Progress').then(module => ({ default: module.Progress })));
const Profile = lazy(() => import('@/pages/Profile').then(module => ({ default: module.Profile })));
const Legal = lazy(() => import('@/pages/Legal').then(module => ({ default: module.Legal })));
const DatabaseTest = lazy(() => import('@/pages/DatabaseTest').then(module => ({ default: module.DatabaseTest })));
const JournalTest = lazy(() => import('@/pages/JournalTest').then(module => ({ default: module.JournalTest })));
const DiagnosticTest = lazy(() => import('@/pages/DiagnosticTest').then(module => ({ default: module.DiagnosticTest })));

function App() {
  // Initialize database health monitoring
  useHealthMonitoring();
  
  // Initialize energy regeneration system
  useEnergyRegeneration();
  
  return (
    <QueryProvider>
      <SupabaseProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Spinner className="w-8 h-8" />
            </div>
          }>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route
                  path="/adventure"
                  element={
                    <ProtectedRoute>
                      <Adventure />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/progress"
                  element={
                    <ProtectedRoute>
                      <Progress />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/legal" element={<Legal />} />
                <Route path="/auth/callback" element={<Home />} />
                <Route
                  path="/database-test"
                  element={
                    <AdminProtectedRoute>
                      <DatabaseTest />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/journal-test"
                  element={
                    <AdminProtectedRoute>
                      <JournalTest />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/diagnostic-test"
                  element={
                    <AdminProtectedRoute>
                      <DiagnosticTest />
                    </AdminProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </SupabaseProvider>
    </QueryProvider>
  );
}

export default App;
