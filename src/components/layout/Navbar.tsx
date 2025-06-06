
import { Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-white/20 backdrop-blur-xl">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent animate-glow">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Luminari's Quest
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-2 text-sm font-medium">
            <Link 
              to="/adventure" 
              className="nav-link px-4 py-2 rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            >
              Adventure
            </Link>
            <Link 
              to="/progress" 
              className="nav-link px-4 py-2 rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            >
              Progress
            </Link>
            <Link 
              to="/profile" 
              className="nav-link px-4 py-2 rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            >
              Profile
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button 
            variant="ghost" 
            className="md:hidden glass-hover p-2" 
            size="icon"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
