import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useSupabase } from '@/lib/providers/supabase-context';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, error } = useSupabase();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-neutral-100">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-neutral-100">
        <div className="w-full max-w-md p-6 text-center">
          <div className="glass rounded-2xl p-8">
            <div className="bg-destructive/10 mx-auto mb-4 w-fit rounded-full p-4">
              <Sparkles className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="mb-4 font-heading text-2xl font-bold">Authentication Error</h2>
            <p className="mb-6 text-muted-foreground">
              {error.message || 'Failed to initialize authentication'}
            </p>
            <Button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-background via-neutral-100 to-background">
      <header>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
      </header>

      <div className="flex flex-1">
        <nav aria-label="Main navigation">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </nav>

        <main className="flex-1 overflow-y-auto" id="main-content">
          <div className="container px-4 py-8 md:px-6">
            <Outlet />
          </div>
        </main>
      </div>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}
