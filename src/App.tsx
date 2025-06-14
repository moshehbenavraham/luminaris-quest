import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from '@/lib/providers/query-provider';
import { SupabaseProvider } from '@/lib/providers/supabase-provider';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Home } from '@/pages/Home';
import { Adventure } from '@/pages/Adventure';
import { Progress } from '@/pages/Progress';
import { Profile } from '@/pages/Profile';
import { Legal } from '@/pages/Legal';

function App() {
  return (
    <QueryProvider>
      <SupabaseProvider>
        <Router>
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
            </Route>
          </Routes>
        </Router>
      </SupabaseProvider>
    </QueryProvider>
  );
}

export default App;
