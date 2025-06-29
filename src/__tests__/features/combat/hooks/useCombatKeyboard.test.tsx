/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCombatKeyboard } from '../../../../features/combat/hooks/useCombatKeyboard';
import { useCombatStore } from '../../../../features/combat/hooks/useCombatStore';
import type { ShadowManifestation } from '../../../../store/game-store';

// Mock the combat hooks
vi.mock('../../../../features/combat/hooks/useCombatStore', () => ({
  useCombatStore: vi.fn(),
}));

describe('useCombatKeyboard', () => {
  const mockStore = {
    isActive: false,
    isPlayerTurn: false,
    executeAction: vi.fn(),
    endTurn: vi.fn(),
    surrender: vi.fn(),
    canUseAction: vi.fn(),
  };

  const mockEnemy: ShadowManifestation = {
    id: 'test-shadow',
    name: 'Test Shadow',
    type: 'doubt',
    description: 'A test shadow',
    maxHP: 20,
    currentHP: 20,
    abilities: [],
    scene: 'test-scene',
    isDefeated: false,
  };

  beforeEach(() => {
    vi.mocked(useCombatStore).mockReturnValue(mockStore);
    mockStore.executeAction.mockClear();
    mockStore.endTurn.mockClear();
    mockStore.surrender.mockClear();
    mockStore.canUseAction.mockClear();
  });

  afterEach(() => {
    // Clean up event listeners
    document.removeEventListener('keydown', vi.fn());
  });

  it('returns keyboard shortcuts information', () => {
    const { result } = renderHook(() => useCombatKeyboard());
    
    expect(result.current.shortcuts).toHaveLength(6);
    expect(result.current.shortcuts[0]).toEqual({
      key: '1',
      action: 'ILLUMINATE',
      description: 'Illuminate'
    });
    expect(result.current.shortcuts[5]).toEqual({
      key: 'Escape',
      action: null,
      description: 'Surrender'
    });
  });

  it('does not add event listeners when combat is not active', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    mockStore.isActive = false;
    
    renderHook(() => useCombatKeyboard());
    
    expect(addEventListenerSpy).not.toHaveBeenCalled();
    addEventListenerSpy.mockRestore();
  });

  it('adds event listeners when combat is active', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    mockStore.isActive = true;
    
    renderHook(() => useCombatKeyboard());
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addEventListenerSpy.mockRestore();
  });

  it('removes event listeners on cleanup', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    mockStore.isActive = true;
    
    const { unmount } = renderHook(() => useCombatKeyboard());
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  describe('Keyboard shortcuts', () => {
    beforeEach(() => {
      mockStore.isActive = true;
      mockStore.isPlayerTurn = true;
      mockStore.canUseAction.mockReturnValue(true);
    });

    it('executes ILLUMINATE action on key "1"', () => {
      renderHook(() => useCombatKeyboard());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.canUseAction).toHaveBeenCalledWith('ILLUMINATE');
      expect(mockStore.executeAction).toHaveBeenCalledWith('ILLUMINATE');
    });

    it('executes REFLECT action on key "2"', () => {
      renderHook(() => useCombatKeyboard());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '2' });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.canUseAction).toHaveBeenCalledWith('REFLECT');
      expect(mockStore.executeAction).toHaveBeenCalledWith('REFLECT');
    });

    it('executes ENDURE action on key "3"', () => {
      renderHook(() => useCombatKeyboard());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '3' });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.canUseAction).toHaveBeenCalledWith('ENDURE');
      expect(mockStore.executeAction).toHaveBeenCalledWith('ENDURE');
    });

    it('executes EMBRACE action on key "4"', () => {
      renderHook(() => useCombatKeyboard());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '4' });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.canUseAction).toHaveBeenCalledWith('EMBRACE');
      expect(mockStore.executeAction).toHaveBeenCalledWith('EMBRACE');
    });

    it('ends turn on Space key', () => {
      renderHook(() => useCombatKeyboard());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: ' ' });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.endTurn).toHaveBeenCalled();
    });

    it('ends turn on Enter key', () => {
      renderHook(() => useCombatKeyboard());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.endTurn).toHaveBeenCalled();
    });

    it('surrenders on Escape key', () => {
      renderHook(() => useCombatKeyboard());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.surrender).toHaveBeenCalled();
    });

    it('does not execute actions when action cannot be used', () => {
      mockStore.canUseAction.mockReturnValue(false);
      renderHook(() => useCombatKeyboard());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.canUseAction).toHaveBeenCalledWith('ILLUMINATE');
      expect(mockStore.executeAction).not.toHaveBeenCalled();
    });

    it('does not handle shortcuts when combat is not active', () => {
      mockStore.isActive = false;
      renderHook(() => useCombatKeyboard());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.executeAction).not.toHaveBeenCalled();
    });

    it('does not handle shortcuts when it is not player turn', () => {
      mockStore.isPlayerTurn = false;
      renderHook(() => useCombatKeyboard());
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.executeAction).not.toHaveBeenCalled();
    });

    it('ignores shortcuts when typing in input fields', () => {
      renderHook(() => useCombatKeyboard());
      
      // Mock input element as target
      const mockInput = document.createElement('input');
      Object.defineProperty(mockInput, 'tagName', { value: 'INPUT' });
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        Object.defineProperty(event, 'target', { value: mockInput });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.executeAction).not.toHaveBeenCalled();
    });

    it('ignores shortcuts when typing in textarea fields', () => {
      renderHook(() => useCombatKeyboard());
      
      // Mock textarea element as target
      const mockTextarea = document.createElement('textarea');
      Object.defineProperty(mockTextarea, 'tagName', { value: 'TEXTAREA' });
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        Object.defineProperty(event, 'target', { value: mockTextarea });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.executeAction).not.toHaveBeenCalled();
    });

    it('ignores shortcuts when typing in contentEditable elements', () => {
      renderHook(() => useCombatKeyboard());
      
      // Mock contentEditable element as target
      const mockDiv = document.createElement('div');
      mockDiv.contentEditable = 'true';
      
      act(() => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        Object.defineProperty(event, 'target', { value: mockDiv });
        document.dispatchEvent(event);
      });
      
      expect(mockStore.executeAction).not.toHaveBeenCalled();
    });

    it('prevents default behavior for handled keys', () => {
      renderHook(() => useCombatKeyboard());
      
      const event = new KeyboardEvent('keydown', { key: '1' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      act(() => {
        document.dispatchEvent(event);
      });
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('does not prevent default for unhandled keys', () => {
      renderHook(() => useCombatKeyboard());
      
      const event = new KeyboardEvent('keydown', { key: 'a' });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      act(() => {
        document.dispatchEvent(event);
      });
      
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });
});