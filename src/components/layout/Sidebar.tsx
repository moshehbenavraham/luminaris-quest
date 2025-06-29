// Built with Bolt.new
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
          'glass fixed left-0 top-0 z-50 h-full w-72 border-r border-white/20 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-2">
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
            <h2 className="mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text px-2 font-heading text-lg font-bold tracking-tight text-transparent">
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
                    'hover:scale-105 hover:bg-primary/10 hover:text-primary',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isActive &&
                      'bg-gradient-to-r from-primary to-accent font-bold text-white shadow-primary',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer info */}
          <div className="border-t border-white/10 p-6">
            <p className="text-center text-xs text-muted-foreground">© 2024 Luminari&apos;s Quest</p>
          </div>
        </div>
      </aside>
    </>
  );
}
