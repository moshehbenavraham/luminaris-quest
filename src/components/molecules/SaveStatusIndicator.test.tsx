/* eslint-disable @typescript-eslint/no-explicit-any -- Test file mocks require any */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveStatusIndicator } from '@/components/molecules/SaveStatusIndicator';
import { useGameStoreBase } from '@/store/game-store';

// Mock the game store
vi.mock('@/store/game-store');

const mockUseGameStoreBase = vi.mocked(useGameStoreBase);

describe('SaveStatusIndicator', () => {
  const mockSaveToSupabase = vi.fn();
  const mockClearSaveError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock state
    mockUseGameStoreBase.mockImplementation((selector: any) => {
      const mockState = {
        saveState: {
          status: 'idle',
          hasUnsavedChanges: false,
          lastSaveTimestamp: Date.now(),
          retryCount: 0,
          lastError: undefined,
        },
        saveToSupabase: mockSaveToSupabase,
        clearSaveError: mockClearSaveError,
      };
      return selector(mockState);
    });
  });

  describe('Status Display', () => {
    it('should show "All changes saved" when no unsaved changes', () => {
      render(<SaveStatusIndicator />);

      expect(screen.getByText('All changes saved')).toBeInTheDocument();
    });

    it('should show "Unsaved changes" when there are unsaved changes', () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'success',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined,
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('should show "Saving..." when saving is in progress', () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'saving',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined,
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show "Save failed" when there is an error', () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'error',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 2,
            lastError: 'Network error',
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  describe('Time Display', () => {
    it('should show "Just now" for recent saves', () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'success',
            hasUnsavedChanges: false,
            lastSaveTimestamp: Date.now() - 30000, // 30 seconds ago
            retryCount: 0,
            lastError: undefined,
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      expect(screen.getByText('Saved Just now')).toBeInTheDocument();
    });

    it('should show minutes for saves within an hour', () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'success',
            hasUnsavedChanges: false,
            lastSaveTimestamp: Date.now() - 5 * 60 * 1000, // 5 minutes ago
            retryCount: 0,
            lastError: undefined,
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      expect(screen.getByText('Saved 5 min ago')).toBeInTheDocument();
    });

    it('should show "Never" when no save timestamp exists', () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'idle',
            hasUnsavedChanges: true,
            lastSaveTimestamp: undefined,
            retryCount: 0,
            lastError: undefined,
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      expect(screen.getByText('Not saved')).toBeInTheDocument();
    });
  });

  describe('Manual Save Button', () => {
    it('should show "Save Now" button when there are unsaved changes', () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'idle',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined,
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      expect(screen.getByRole('button', { name: 'Save Now' })).toBeInTheDocument();
    });

    it('should not show "Save Now" button when no unsaved changes', () => {
      render(<SaveStatusIndicator />);

      expect(screen.queryByRole('button', { name: 'Save Now' })).not.toBeInTheDocument();
    });

    it('should call saveToSupabase when "Save Now" is clicked', async () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'idle',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined,
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      const saveButton = screen.getByRole('button', { name: 'Save Now' });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSaveToSupabase).toHaveBeenCalledTimes(1);
      });
    });

    it('should disable "Save Now" button when saving', () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'saving',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined,
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      // Button is hidden (not disabled) during saving
      expect(screen.queryByRole('button', { name: 'Save Now' })).not.toBeInTheDocument();
    });
  });

  describe('Retry Button', () => {
    it('should show "Retry" button when there is an error', () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'error',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 1,
            lastError: 'Network error',
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    });

    it('should call clearSaveError and saveToSupabase when "Retry" is clicked', async () => {
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'error',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 1,
            lastError: 'Network error',
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(mockClearSaveError).toHaveBeenCalledTimes(1);
        expect(mockSaveToSupabase).toHaveBeenCalledTimes(1);
      });
    });

    it('should not show "Retry" button when no error', () => {
      render(<SaveStatusIndicator />);

      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should show error details in tooltip', async () => {
      const user = userEvent.setup();

      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'error',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 2,
            lastError: 'Network connection failed',
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      render(<SaveStatusIndicator />);

      // Hover over the retry button to show tooltip
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await user.hover(retryButton);

      // Radix UI has a 700ms default delay before showing tooltips
      await waitFor(
        () => {
          // Radix UI renders tooltip content multiple times for accessibility, so use getAllByText
          expect(screen.getAllByText('Save failed')[0]).toBeInTheDocument();
          expect(screen.getAllByText('Network connection failed')[0]).toBeInTheDocument();
          expect(screen.getAllByText('Retried 2 times')[0]).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });
  });

  describe('Visual States', () => {
    it('should have correct styling for different states', () => {
      const { rerender } = render(<SaveStatusIndicator />);

      // Test idle state
      expect(screen.getByText('All changes saved')).toHaveClass('text-gray-400');

      // Test unsaved changes state
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'success',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined,
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      rerender(<SaveStatusIndicator />);
      expect(screen.getByText('Unsaved changes')).toHaveClass('text-amber-500');

      // Test saving state
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'saving',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined,
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      rerender(<SaveStatusIndicator />);
      expect(screen.getByText('Saving...')).toHaveClass('text-blue-500');

      // Test error state
      mockUseGameStoreBase.mockImplementation((selector: any) => {
        const mockState = {
          saveState: {
            status: 'error',
            hasUnsavedChanges: true,
            lastSaveTimestamp: Date.now(),
            retryCount: 1,
            lastError: 'Error message',
          },
          saveToSupabase: mockSaveToSupabase,
          clearSaveError: mockClearSaveError,
        };
        return selector(mockState);
      });

      rerender(<SaveStatusIndicator />);
      expect(screen.getByText('Save failed')).toHaveClass('text-red-500');
    });
  });
});
