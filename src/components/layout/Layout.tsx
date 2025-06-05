import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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