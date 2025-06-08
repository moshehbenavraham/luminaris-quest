import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useSupabase } from '@/lib/providers/supabase-provider';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, error } = useSupabase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-neutral-100">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-neutral-100">
        <div className="max-w-md w-full p-6 text-center">
          <div className="glass rounded-2xl p-8">
            <div className="p-4 rounded-full bg-destructive/10 mx-auto mb-4 w-fit">
              <Sparkles className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-4">Authentication Error</h2>
            <p className="text-muted-foreground mb-6">
              {error.message || 'Failed to initialize authentication'}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-background via-neutral-100 to-background">
      <header>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
      </header>
      
      <div className="flex flex-1">
        <nav aria-label="Main navigation">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </nav>
        
        <main className="flex-1 overflow-y-auto" id="main-content">
          <div className="container py-8 px-4 md:px-6">
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