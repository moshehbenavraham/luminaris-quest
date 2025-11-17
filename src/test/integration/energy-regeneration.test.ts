import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStoreBase } from '@/store/game-store';

// Mock the environment config
vi.mock('@/lib/environment', () => ({
  getEnvironmentConfig: () => ({
    energyRegenInterval: 100, // Use 100ms for faster tests
    enableDebugLogging: false,
    enableVerboseLogging: false
  }),
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }),
  environment: {
    current: () => 'local'
  },
  detectEnvironment: () => 'local'
}));

describe('Energy Regeneration System', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock document properties for tests
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: false
    });
    
    Object.defineProperty(document, 'hasFocus', {
      writable: true,
      configurable: true,
      value: () => true
    });
    
    // Reset the store before each test
    const { result } = renderHook(() => useGameStoreBase());
    act(() => {
      result.current.resetGame();
      // Ensure store is hydrated
      result.current._setHasHydrated(true);
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should regenerate energy when regenerateEnergy is called directly', () => {
    const { result } = renderHook(() => useGameStoreBase());
    
    // Set energy below max
    act(() => {
      result.current.setPlayerEnergy(50);
      result.current._setHasHydrated(true);
    });
    
    expect(result.current.playerEnergy).toBe(50);
    
    // Call regenerate directly
    act(() => {
      result.current.regenerateEnergy();
    });
    
    expect(result.current.playerEnergy).toBe(51);
  });

  it('should start energy regeneration', () => {
    const { result } = renderHook(() => useGameStoreBase());
    
    // We can't test internal state directly, but we can verify regeneration works
    act(() => {
      result.current.setPlayerEnergy(50);
      result.current.startEnergyRegeneration();
    });
    
    // Advance timer and check if energy regenerated
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.playerEnergy).toBe(51);
  });

  it('should stop energy regeneration', () => {
    const { result } = renderHook(() => useGameStoreBase());
    
    // Start regeneration first
    act(() => {
      result.current.setPlayerEnergy(50);
      result.current.startEnergyRegeneration();
    });
    
    // Verify it's working
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.playerEnergy).toBe(51);
    
    // Stop regeneration
    act(() => {
      result.current.stopEnergyRegeneration();
    });
    
    // Advance timer - energy should not regenerate
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.playerEnergy).toBe(51); // Should stay at 51
  });

  it('should regenerate 1 energy every interval', () => {
    const { result } = renderHook(() => useGameStoreBase());
    
    // Set energy below max
    act(() => {
      result.current.setPlayerEnergy(50);
    });
    
    expect(result.current.playerEnergy).toBe(50);
    
    // Start regeneration
    act(() => {
      result.current.startEnergyRegeneration();
    });
    
    // Advance timer by one interval
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.playerEnergy).toBe(51);
    
    // Advance timer by another interval
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.playerEnergy).toBe(52);
  });

  it('should not regenerate beyond max energy', () => {
    const { result } = renderHook(() => useGameStoreBase());
    
    // Set energy close to max
    act(() => {
      result.current.setPlayerEnergy(99);
    });
    
    // Start regeneration
    act(() => {
      result.current.startEnergyRegeneration();
    });
    
    // Advance timer by one interval
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.playerEnergy).toBe(100);
    
    // Advance timer by another interval - should stay at 100
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.playerEnergy).toBe(100);
  });

  it('should not regenerate during combat', () => {
    const { result } = renderHook(() => useGameStoreBase());
    
    // Set energy below max and start combat
    act(() => {
      result.current.setPlayerEnergy(50);
      result.current.combat.inCombat = true;
    });
    
    // Start regeneration
    act(() => {
      result.current.startEnergyRegeneration();
    });
    
    // Advance timer by one interval
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Energy should not have regenerated
    expect(result.current.playerEnergy).toBe(50);
  });

  it('should resume regeneration after combat ends', () => {
    const { result } = renderHook(() => useGameStoreBase());
    
    // Set energy below max and start combat
    act(() => {
      result.current.setPlayerEnergy(50);
      result.current.combat.inCombat = true;
    });
    
    // Start regeneration
    act(() => {
      result.current.startEnergyRegeneration();
    });
    
    // Advance timer - no regeneration during combat
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.playerEnergy).toBe(50);
    
    // End combat
    act(() => {
      result.current.combat.inCombat = false;
    });
    
    // Advance timer - regeneration should resume
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.playerEnergy).toBe(51);
  });

  it('should not start multiple regeneration timers', () => {
    const { result } = renderHook(() => useGameStoreBase());
    
    act(() => {
      result.current.setPlayerEnergy(50);
    });
    
    // Start regeneration multiple times
    act(() => {
      result.current.startEnergyRegeneration();
      result.current.startEnergyRegeneration();
      result.current.startEnergyRegeneration();
    });
    
    // Advance timer by one interval
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // Should only regenerate 1 energy, not 3
    expect(result.current.playerEnergy).toBe(51);
  });

  it('should mark save state as changed when energy regenerates', () => {
    const { result } = renderHook(() => useGameStoreBase());
    
    // Reset save state and set energy below max
    act(() => {
      result.current.clearSaveError();
      result.current.setPlayerEnergy(50);
    });
    
    // Clear the save state change from setPlayerEnergy
    act(() => {
      result.current.saveState.hasUnsavedChanges = false;
    });
    
    // Start regeneration
    act(() => {
      result.current.startEnergyRegeneration();
    });
    
    // Advance timer by one interval
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.saveState.hasUnsavedChanges).toBe(true);
  });

  it('should handle document visibility for performance', () => {
    const { result } = renderHook(() => useGameStoreBase());
    
    act(() => {
      result.current.setPlayerEnergy(50);
      result.current.startEnergyRegeneration();
    });
    
    // Mock document as hidden
    Object.defineProperty(document, 'hidden', {
      writable: true,
      configurable: true,
      value: true
    });
    
    // Advance timer - should not regenerate when hidden
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.playerEnergy).toBe(50);
    
    // Mock document as visible
    Object.defineProperty(document, 'hidden', {
      value: false
    });
    
    // Mock document has focus
    Object.defineProperty(document, 'hasFocus', {
      writable: true,
      configurable: true,
      value: () => true
    });
    
    // Advance timer - should regenerate when visible
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.playerEnergy).toBe(51);
  });
}); 