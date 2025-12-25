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
      <div className="from-background flex min-h-screen items-center justify-center bg-gradient-to-br to-neutral-100">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="from-background flex min-h-screen items-center justify-center bg-gradient-to-br to-neutral-100">
        <div className="w-full max-w-md p-6 text-center">
          <div className="glass rounded-2xl p-8">
            <div className="bg-destructive/10 mx-auto mb-4 w-fit rounded-full p-4">
              <Sparkles className="text-destructive h-8 w-8" />
            </div>
            <h2 className="font-heading mb-4 text-2xl font-bold">Authentication Error</h2>
            <p className="text-muted-foreground mb-6">
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
    <div className="from-background to-background relative flex min-h-screen flex-col bg-gradient-to-br via-neutral-100">
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
