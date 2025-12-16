import { Link, useLocation } from 'react-router-dom';
import { Home, Swords, TrendingUp, User, Scale, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/adventure', label: 'Adventure', icon: Swords },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/legal', label: 'Legal', icon: Scale },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'glass fixed top-0 left-0 z-50 h-full w-72 border-r border-white/20 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="from-primary to-accent rounded-xl bg-gradient-to-br p-2">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading text-lg font-bold">Menu</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="glass-hover"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 p-6">
            <h2 className="from-primary to-accent font-heading mb-6 bg-gradient-to-r bg-clip-text px-2 text-lg font-bold tracking-tight text-transparent">
              Navigation
            </h2>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    'hover:bg-primary/10 hover:text-primary hover:scale-105',
                    'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none',
                    isActive &&
                      'from-primary to-accent shadow-primary bg-gradient-to-r font-bold text-white',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer info */}
          <div className="border-t border-white/10 p-6">
            <p className="text-muted-foreground text-center text-xs">
              © 2024 Luminari&apos;s Quest
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
