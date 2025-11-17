import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useGameStoreBase } from '@/store/game-store';
import { useSupabase } from '@/lib/providers/supabase-context';

// Mock the dependencies
vi.mock('@/store/game-store');
vi.mock('@/lib/providers/supabase-context');
vi.mock('@/lib/environment', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }),
  environment: {
    current: 'test',
    isProduction: false,
    isDevelopment: false,
    isStaging: false,
    isLocal: true
  },
  featureFlags: {
    enablePerformanceMonitoring: vi.fn(() => false)
  },
  getEnvironmentConfig: vi.fn(() => ({
    name: 'test',
    enableLogging: false,
    apiTimeout: 5000
  }))
}));

vi.mock('@/lib/database-health', () => ({
  detectEnvironment: vi.fn(() => 'test'),
  performEnhancedHealthCheck: vi.fn(),
  getCurrentHealthStatus: vi.fn(() => ({
    isConnected: true,
    responseTime: 0,
    lastChecked: Date.now(),
    environment: 'test'
  }))
}));

const mockUseGameStore = vi.mocked(useGameStoreBase);
const mockUseSupabase = vi.mocked(useSupabase);

describe('useAutoSave', () => {
  const mockSaveToSupabase = vi.fn();
  const mockUser = { id: 'test-user', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Setup default mocks
    mockUseSupabase.mockReturnValue({
      user: mockUser,
      loading: false,
      supabase: {} as any
    });

    mockUseGameStore.mockImplementation((selector: any) => {
      const mockState = {
        saveToSupabase: mockSaveToSupabase,
        saveState: {
          hasUnsavedChanges: false,
          status: 'idle' as const,
          lastSaveTimestamp: Date.now(),
          retryCount: 0,
          lastError: undefined
        }
      };
      return selector(mockState);
    });

    // Mock window methods
    Object.defineProperty(window, 'addEventListener', {
      value: vi.fn(),
      writable: true
    });
    Object.defineProperty(window, 'removeEventListener', {
      value: vi.fn(),
      writable: true
    });
    Object.defineProperty(document, 'hidden', {
      value: false,
      writable: true
    });
    Object.defineProperty(document, 'hasFocus', {
      value: vi.fn(() => true),
      writable: true
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should initialize without errors', () => {
      const { result } = renderHook(() => useAutoSave());
      
      expect(result.current).toBeDefined();
      expect(result.current.saveNow).toBeInstanceOf(Function);
      expect(result.current.saveStatus).toBe('idle');
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should not save when user is not authenticated', () => {
      mockUseSupabase.mockReturnValue({
        user: null,
        loading: false,
        supabase: {} as any
      });

      const { result } = renderHook(() => useAutoSave());
      
      act(() => {
        result.current.saveNow();
      });

      expect(mockSaveToSupabase).not.toHaveBeenCalled();
    });

    it('should not save when disabled', () => {
      const { result } = renderHook(() => useAutoSave({ enabled: false }));
      
      act(() => {
        result.current.saveNow();
      });

      expect(mockSaveToSupabase).not.toHaveBeenCalled();
    });
  });

  describe('Debounced auto-save', () => {
    it('should trigger debounced save when unsaved changes detected', async () => {
      let saveStateUpdater: any;
      
      mockUseGameStore.mockImplementation((selector: any) => {
        const mockState = {
          saveToSupabase: mockSaveToSupabase,
          saveState: {
            hasUnsavedChanges: true,
            status: 'idle' as const,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined
          }
        };
        const result = selector(mockState);
        
        // Capture the selector function to trigger updates
        if (typeof result === 'boolean' && result === true) {
          saveStateUpdater = selector;
        }
        
        return result;
      });

      renderHook(() => useAutoSave({ debounceDelay: 1000 }));

      // Fast-forward past debounce delay
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSaveToSupabase).toHaveBeenCalledTimes(1);
      });
    });

    it('should not save if already saving', () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const mockState = {
          saveToSupabase: mockSaveToSupabase,
          saveState: {
            hasUnsavedChanges: true,
            status: 'saving' as const,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined
          }
        };
        return selector(mockState);
      });

      const { result } = renderHook(() => useAutoSave());
      
      act(() => {
        result.current.saveNow();
      });

      expect(mockSaveToSupabase).not.toHaveBeenCalled();
    });
  });

  describe('Periodic auto-save', () => {
    it('should set up periodic save interval', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      renderHook(() => useAutoSave({ interval: 30000 }));

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        30000
      );
    });

    it('should clear interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      
      const { unmount } = renderHook(() => useAutoSave());
      
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should save periodically when unsaved changes exist', async () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const mockState = {
          saveToSupabase: mockSaveToSupabase,
          saveState: {
            hasUnsavedChanges: true,
            status: 'idle' as const,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined
          }
        };
        return selector(mockState);
      });

      renderHook(() => useAutoSave({ interval: 1000 }));

      // Fast-forward past interval
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockSaveToSupabase).toHaveBeenCalledTimes(1);
      });
    });

    it('should skip periodic save when app is not active', () => {
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true
      });

      mockUseGameStore.mockImplementation((selector: any) => {
        const mockState = {
          saveToSupabase: mockSaveToSupabase,
          saveState: {
            hasUnsavedChanges: true,
            status: 'idle' as const,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined
          }
        };
        return selector(mockState);
      });

      renderHook(() => useAutoSave({ interval: 1000 }));

      // Fast-forward past interval
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockSaveToSupabase).not.toHaveBeenCalled();
    });
  });

  describe('beforeunload handling', () => {
    it('should set up beforeunload listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      renderHook(() => useAutoSave());

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });

    it('should remove beforeunload listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useAutoSave());
      
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });
  });

  describe('Manual save trigger', () => {
    it('should trigger immediate save when saveNow is called', async () => {
      mockUseGameStore.mockImplementation((selector: any) => {
        const mockState = {
          saveToSupabase: mockSaveToSupabase,
          saveState: {
            hasUnsavedChanges: true,
            status: 'idle' as const,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined
          }
        };
        return selector(mockState);
      });

      const { result } = renderHook(() => useAutoSave());
      
      await act(async () => {
        result.current.saveNow();
      });

      expect(mockSaveToSupabase).toHaveBeenCalledTimes(1);
    });

    it('should not save when no unsaved changes', () => {
      const { result } = renderHook(() => useAutoSave());
      
      act(() => {
        result.current.saveNow();
      });

      expect(mockSaveToSupabase).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle save errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSaveToSupabase.mockRejectedValueOnce(new Error('Save failed'));
      
      mockUseGameStore.mockImplementation((selector: any) => {
        const mockState = {
          saveToSupabase: mockSaveToSupabase,
          saveState: {
            hasUnsavedChanges: true,
            status: 'idle' as const,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined
          }
        };
        return selector(mockState);
      });

      const { result } = renderHook(() => useAutoSave());
      
      await act(async () => {
        result.current.saveNow();
      });

      expect(mockSaveToSupabase).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Configuration options', () => {
    it('should respect custom interval setting', () => {
      const setIntervalSpy = vi.spyOn(global, 'setInterval');
      
      renderHook(() => useAutoSave({ interval: 60000 }));

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function),
        60000
      );
    });

    it('should respect custom debounce delay', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      mockUseGameStore.mockImplementation((selector: any) => {
        const mockState = {
          saveToSupabase: mockSaveToSupabase,
          saveState: {
            hasUnsavedChanges: true,
            status: 'idle' as const,
            lastSaveTimestamp: Date.now(),
            retryCount: 0,
            lastError: undefined
          }
        };
        return selector(mockState);
      });

      renderHook(() => useAutoSave({ debounceDelay: 10000 }));

      expect(setTimeoutSpy).toHaveBeenCalledWith(
        expect.any(Function),
        10000
      );
    });
  });
});