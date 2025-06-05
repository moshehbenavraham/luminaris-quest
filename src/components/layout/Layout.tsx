import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useSupabase } from '@/lib/providers/supabase-provider';
import { Button } from '@/components/ui/button';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, error } = useSupabase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">
            {error.message || 'Failed to initialize authentication'}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <header>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
      </header>
      
      <div className="flex flex-1">
        <nav aria-label="Main navigation">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </nav>
        
        <main className="flex-1 overflow-y-auto" id="main-content">
          <div className="container py-6">
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