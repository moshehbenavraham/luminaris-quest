import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CombatOverlay } from '@/components/combat/CombatOverlay';
import '@testing-library/jest-dom';

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

// Mock the useCombat hook
vi.mock('@/hooks/useCombat', () => ({
  useCombat: () => ({
    isActive: true,
    enemy: {
      id: 'test-enemy',
      name: 'Test Shadow',
      type: 'doubt',
      description: 'A test shadow',
      currentHP: 15,
      maxHP: 15,
      abilities: [],
      therapeuticInsight: 'Test insight',
      victoryReward: { lpBonus: 5, growthMessage: 'Test message', permanentBenefit: 'Test benefit' }
    },
    resources: { lp: 10, sp: 5 },
    turn: 1,
    log: [],
    statusEffects: {},
    canUseAction: () => true,
    getActionCost: () => ({ lp: 2 }),
    getActionDescription: () => 'Test description',
    isPlayerTurn: true,
    combatEndStatus: { isEnded: false, victory: false },
    executeAction: vi.fn(),
    playerHealth: 100,
    playerLevel: 1,
    endCombat: vi.fn(),
    endTurn: vi.fn(),
    getTherapeuticInsight: () => 'Test therapeutic insight'
  })
}));

// Mock other dependencies
vi.mock('@/hooks/useCombatSounds', () => ({
  useCombatSounds: () => ({
    playVictorySound: vi.fn(),
    playDefeatSound: vi.fn()
  })
}));

vi.mock('@/store/game-store', () => ({
  useGameStore: () => ({
    addJournalEntry: vi.fn(),
    combat: { preferredActions: { ILLUMINATE: 1 } }
  })
}));

// Mock ActionSelector to avoid its dependencies
vi.mock('@/components/combat/ActionSelector', () => ({
  ActionSelector: () => <div data-testid="action-selector">Action Selector</div>
}));

// Mock CombatReflectionModal
vi.mock('@/components/combat/CombatReflectionModal', () => ({
  CombatReflectionModal: ({ isOpen, ...props }: any) =>
    isOpen ? <div data-testid="combat-reflection-modal" {...props}>Reflection Modal</div> : null
}));

describe('CombatOverlay z-index layering', () => {
  it('should render combat overlay with z-[60] class for proper layering above navbar', () => {
    render(<CombatOverlay data-testid="combat-overlay" />);

    const combatOverlay = screen.getByTestId('combat-overlay');
    expect(combatOverlay).toBeInTheDocument();

    // Check z-index classes
    const combatOverlayClasses = combatOverlay.className;
    
    // Combat overlay should have z-[60] which is higher than navbar's z-50
    expect(combatOverlayClasses).toContain('z-[60]');
    expect(combatOverlayClasses).not.toContain('z-50');
  });

  it('should cover the entire viewport with fixed positioning', () => {
    render(<CombatOverlay data-testid="combat-overlay" />);

    const combatOverlay = screen.getByTestId('combat-overlay');
    
    // Check that it has fixed positioning with inset-0 (covers entire viewport)
    expect(combatOverlay).toHaveClass('fixed');
    expect(combatOverlay).toHaveClass('inset-0');
    
    // Verify it has the dark overlay background
    expect(combatOverlay).toHaveClass('bg-black/70');
    
    // Verify it has backdrop blur (centering is now handled by inner container)
    expect(combatOverlay).toHaveClass('backdrop-blur-sm');
  });

  it('should simulate navbar and combat overlay layering with appropriate z-indices', () => {
    const { container } = render(
      <div className="relative">
        {/* Simulated navbar with z-50 */}
        <nav className="glass sticky top-0 z-50 w-full border-b">
          <div className="h-16 bg-white">Navbar</div>
        </nav>
        
        {/* Other UI elements with various z-indices */}
        <div className="z-10">Some content with z-10</div>
        <div className="z-20">Some content with z-20</div>
        <div className="z-30">Some content with z-30</div>
        <div className="z-40">Some content with z-40</div>
        
        {/* Combat overlay */}
        <CombatOverlay data-testid="combat-overlay" />
      </div>
    );

    // Find simulated navbar
    const navbar = container.querySelector('nav');
    expect(navbar).toBeInTheDocument();
    expect(navbar).toHaveClass('z-50');
    
    // Find combat overlay
    const combatOverlay = screen.getByTestId('combat-overlay');
    expect(combatOverlay).toBeInTheDocument();
    
    // Verify combat overlay has higher z-index than navbar
    expect(combatOverlay).toHaveClass('z-[60]');
    
    // Verify combat overlay covers full screen and would overlay navbar
    expect(combatOverlay).toHaveClass('fixed');
    expect(combatOverlay).toHaveClass('inset-0');
  });
}); 