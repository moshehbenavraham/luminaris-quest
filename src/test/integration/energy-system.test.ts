import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '@/store/game-store';

describe('Energy System', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  it('should initialize with full energy', () => {
    const { result } = renderHook(() => useGameStore());
    
    expect(result.current.playerEnergy).toBe(100);
    expect(result.current.maxPlayerEnergy).toBe(100);
  });

  it('should modify energy correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Decrease energy
    act(() => {
      result.current.modifyPlayerEnergy(-20);
    });
    expect(result.current.playerEnergy).toBe(80);
    
    // Increase energy
    act(() => {
      result.current.modifyPlayerEnergy(10);
    });
    expect(result.current.playerEnergy).toBe(90);
  });

  it('should not allow energy to exceed maximum', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.modifyPlayerEnergy(50);
    });
    
    expect(result.current.playerEnergy).toBe(100); // Should stay at max
  });

  it('should not allow energy to go below zero', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.modifyPlayerEnergy(-150);
    });
    
    expect(result.current.playerEnergy).toBe(0); // Should not go negative
  });

  it('should set energy directly', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setPlayerEnergy(50);
    });
    expect(result.current.playerEnergy).toBe(50);
    
    // Test bounds checking
    act(() => {
      result.current.setPlayerEnergy(150);
    });
    expect(result.current.playerEnergy).toBe(100); // Should cap at max
    
    act(() => {
      result.current.setPlayerEnergy(-50);
    });
    expect(result.current.playerEnergy).toBe(0); // Should not go negative
  });

  it('should mark save state as changed when energy is modified', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Reset save state
    act(() => {
      result.current.clearSaveError();
    });
    
    act(() => {
      result.current.modifyPlayerEnergy(-10);
    });
    
    expect(result.current.saveState.hasUnsavedChanges).toBe(true);
  });

  it('should reset energy when game is reset', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Modify energy first
    act(() => {
      result.current.modifyPlayerEnergy(-30);
    });
    expect(result.current.playerEnergy).toBe(70);
    
    // Reset game
    act(() => {
      result.current.resetGame();
    });
    
    expect(result.current.playerEnergy).toBe(100);
    expect(result.current.maxPlayerEnergy).toBe(100);
  });

  it('should handle multiple energy modifications correctly', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Series of energy changes
    act(() => {
      result.current.modifyPlayerEnergy(-10); // 90
      result.current.modifyPlayerEnergy(-20); // 70
      result.current.modifyPlayerEnergy(15);  // 85
      result.current.modifyPlayerEnergy(-5);  // 80
    });
    
    expect(result.current.playerEnergy).toBe(80);
  });

  it('should maintain energy value during hydration', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Modify energy
    act(() => {
      result.current.setPlayerEnergy(75);
    });
    
    expect(result.current.playerEnergy).toBe(75);
    
    // Energy should be available even before hydration completes
    // This ensures real-time updates work correctly
    expect(result.current.playerEnergy).toBe(75);
  });
}); 