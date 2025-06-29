// Built with Bolt.new
import type { ReactNode } from 'react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { SaveStatusIndicator } from '@/components/SaveStatusIndicator';

interface AuthenticatedAppProps {
  children: ReactNode;
}

/**
 * Wrapper component for authenticated parts of the app
 * Provides auto-save functionality and save status display
 */
export function AuthenticatedApp({ children }: AuthenticatedAppProps) {
  // Initialize auto-save for authenticated users
  useAutoSave();

  return (
    <>
      {/* Save status indicator in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <SaveStatusIndicator />
      </div>
      {children}
    </>
  );
}