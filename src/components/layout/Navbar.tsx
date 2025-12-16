import { Menu, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HealthStatus } from '@/components/molecules/HealthStatus';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <nav className="glass sticky top-0 z-50 w-full border-b border-white/20 backdrop-blur-xl">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="group mr-6 flex items-center space-x-3">
            <div className="animate-glow from-ember-gold to-ember-rose rounded-xl bg-gradient-to-br p-2">
              <Sparkles className="text-hearth-deep h-6 w-6" />
            </div>
            <span className="from-ember-gold to-ember-rose font-heading bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
              Luminari&apos;s Quest
            </span>
          </Link>
          <nav className="hidden items-center space-x-2 text-sm font-medium md:flex">
            <Link
              to="/adventure"
              className="nav-link hover:bg-ember-gold/10 hover:text-ember-gold rounded-full px-4 py-2 transition-all duration-200"
            >
              Adventure
            </Link>
            <Link
              to="/progress"
              className="nav-link hover:bg-ember-gold/10 hover:text-ember-gold rounded-full px-4 py-2 transition-all duration-200"
            >
              Progress
            </Link>
            <Link
              to="/profile"
              className="nav-link hover:bg-ember-gold/10 hover:text-ember-gold rounded-full px-4 py-2 transition-all duration-200"
            >
              Profile
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="hidden md:block">
            <HealthStatus compact />
          </div>
          <Button
            variant="ghost"
            className="glass-hover p-2 md:hidden"
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
