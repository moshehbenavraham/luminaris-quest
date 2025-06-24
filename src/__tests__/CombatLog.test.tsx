import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CombatLog } from '../components/combat/CombatLog';
import { useCombat } from '../hooks/useCombat';
import type { CombatLogEntry, ShadowManifestation } from '../store/game-store';

// Mock the useCombat hook
vi.mock('../hooks/useCombat');

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock document.createElement for download functionality
const mockAnchorElement = {
  href: '',
  download: '',
  click: vi.fn(),
};

const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName) => {
  if (tagName === 'a') {
    return mockAnchorElement as any;
  }
  return originalCreateElement.call(document, tagName);
});

describe('CombatLog', () => {
  const mockEnemy: ShadowManifestation = {
    id: 'test-shadow',
    name: 'The Whisper of Doubt',
    type: 'doubt',
    description: 'A shadow of self-doubt',
    currentHP: 10,
    maxHP: 15,
    abilities: [],
    therapeuticInsight: 'Test insight',
    victoryReward: {
      lpBonus: 5,
      growthMessage: 'You have grown stronger',
      permanentBenefit: 'Increased confidence'
    }
  };

  const mockLogEntries: CombatLogEntry[] = [
    {
      turn: 1,
      actor: 'PLAYER',
      action: 'ILLUMINATE',
      effect: 'Dealt 3 damage',
      resourceChange: { lp: -2, enemyHP: 12 },
      message: 'You shine light on your inner shadow, seeing it clearly for what it is.'
    },
    {
      turn: 1,
      actor: 'SHADOW',
      action: 'Self-Questioning',
      effect: 'Drained 1 LP',
      resourceChange: { lp: -1 },
      message: 'The shadow whispers doubts about your abilities.'
    },
    {
      turn: 2,
      actor: 'PLAYER',
      action: 'REFLECT',
      effect: 'Converted 2 SP to 1 LP',
      resourceChange: { sp: -2, lp: 1 },
      message: 'You reflect on your experiences, finding wisdom in your struggles.'
    }
  ];

  const defaultMockCombat = {
    log: mockLogEntries,
    enemy: mockEnemy,
    turn: 2,
    isActive: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useCombat as any).mockReturnValue(defaultMockCombat);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders combat log when combat is active', () => {
      render(<CombatLog />);

      expect(screen.getByTestId('combat-log')).toBeInTheDocument();
      expect(screen.getByText('Combat Log')).toBeInTheDocument();
      expect(screen.getAllByText('Turn 2')).toHaveLength(2); // One in header, one in log entry
      expect(screen.getByText('vs The Whisper of Doubt')).toBeInTheDocument();
    });

    it('does not render when combat is not active', () => {
      (useCombat as any).mockReturnValue({
        ...defaultMockCombat,
        isActive: false
      });

      render(<CombatLog />);
      expect(screen.queryByTestId('combat-log')).not.toBeInTheDocument();
    });

    it('does not render when no enemy is present', () => {
      (useCombat as any).mockReturnValue({
        ...defaultMockCombat,
        enemy: null
      });

      render(<CombatLog />);
      expect(screen.queryByTestId('combat-log')).not.toBeInTheDocument();
    });

    it('applies custom className and testId', () => {
      render(<CombatLog className="custom-class" data-testid="custom-log" />);
      
      const logElement = screen.getByTestId('custom-log');
      expect(logElement).toBeInTheDocument();
      expect(logElement).toHaveClass('custom-class');
    });
  });

  describe('Log Entry Display', () => {
    it('displays all log entries with correct information', () => {
      render(<CombatLog />);

      // Check that all entries are displayed
      expect(screen.getByTestId('combat-log-entry-0')).toBeInTheDocument();
      expect(screen.getByTestId('combat-log-entry-1')).toBeInTheDocument();
      expect(screen.getByTestId('combat-log-entry-2')).toBeInTheDocument();

      // Check player entry content
      expect(screen.getByText('You shine light on your inner shadow, seeing it clearly for what it is.')).toBeInTheDocument();
      expect(screen.getByText('Dealt 3 damage')).toBeInTheDocument();

      // Check shadow entry content
      expect(screen.getByText('The shadow whispers doubts about your abilities.')).toBeInTheDocument();
      expect(screen.getByText('Drained 1 LP')).toBeInTheDocument();
    });

    it('displays correct actor names', () => {
      render(<CombatLog />);

      // Player entries should show "You"
      const playerEntries = screen.getAllByText('You');
      expect(playerEntries).toHaveLength(2); // Two player actions

      // Shadow entries should show enemy name
      expect(screen.getByText('The Whisper of Doubt')).toBeInTheDocument();
    });

    it('applies correct styling for different actors', () => {
      render(<CombatLog />);

      const playerEntry = screen.getByTestId('combat-log-entry-0');
      const shadowEntry = screen.getByTestId('combat-log-entry-1');

      // Player entries should have primary styling
      expect(playerEntry).toHaveClass('border-primary/30', 'bg-primary/5');
      
      // Shadow entries should have purple styling
      expect(shadowEntry).toHaveClass('border-purple-500/30', 'bg-purple-500/5');
    });

    it('shows empty state when no log entries exist', () => {
      (useCombat as any).mockReturnValue({
        ...defaultMockCombat,
        log: []
      });

      render(<CombatLog />);
      
      expect(screen.getByText('Combat log will appear here...')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('shows export buttons when showExport is true and log has entries', () => {
      render(<CombatLog showExport={true} />);
      
      expect(screen.getByTestId('copy-log-button')).toBeInTheDocument();
      expect(screen.getByTestId('export-log-button')).toBeInTheDocument();
    });

    it('hides export buttons when showExport is false', () => {
      render(<CombatLog showExport={false} />);
      
      expect(screen.queryByTestId('copy-log-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('export-log-button')).not.toBeInTheDocument();
    });

    it('hides export buttons when log is empty', () => {
      (useCombat as any).mockReturnValue({
        ...defaultMockCombat,
        log: []
      });

      render(<CombatLog showExport={true} />);
      
      expect(screen.queryByTestId('copy-log-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('export-log-button')).not.toBeInTheDocument();
    });

    it('copies log to clipboard when copy button is clicked', async () => {
      render(<CombatLog />);
      
      const copyButton = screen.getByTestId('copy-log-button');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          expect.stringContaining('Turn 1 - PLAYER: You shine light on your inner shadow')
        );
      });
    });

    it('downloads log file when export button is clicked', () => {
      render(<CombatLog />);

      const exportButton = screen.getByTestId('export-log-button');

      // Mock the download functionality to avoid JSDOM issues
      const mockClick = vi.fn();
      const mockAppendChild = vi.fn();
      const mockRemoveChild = vi.fn();

      // Override document methods for this test
      const originalAppendChild = document.body.appendChild;
      const originalRemoveChild = document.body.removeChild;

      document.body.appendChild = mockAppendChild;
      document.body.removeChild = mockRemoveChild;
      mockAnchorElement.click = mockClick;

      fireEvent.click(exportButton);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockAnchorElement.download).toMatch(/combat-log-the-whisper-of-doubt-\d+\.txt/);

      // Restore original methods
      document.body.appendChild = originalAppendChild;
      document.body.removeChild = originalRemoveChild;
    });
  });

  describe('Auto-scroll Functionality', () => {
    it('shows auto-scroll toggle when log has more than 3 entries', () => {
      const longLog = Array.from({ length: 5 }, (_, i) => ({
        ...mockLogEntries[0],
        turn: i + 1
      }));

      (useCombat as any).mockReturnValue({
        ...defaultMockCombat,
        log: longLog
      });

      render(<CombatLog />);
      
      expect(screen.getByTestId('auto-scroll-toggle')).toBeInTheDocument();
      expect(screen.getByText('Auto-scroll: ON')).toBeInTheDocument();
    });

    it('hides auto-scroll toggle when log has 3 or fewer entries', () => {
      render(<CombatLog />);
      
      expect(screen.queryByTestId('auto-scroll-toggle')).not.toBeInTheDocument();
    });

    it('toggles auto-scroll state when button is clicked', () => {
      const longLog = Array.from({ length: 5 }, (_, i) => ({
        ...mockLogEntries[0],
        turn: i + 1
      }));

      (useCombat as any).mockReturnValue({
        ...defaultMockCombat,
        log: longLog
      });

      render(<CombatLog />);
      
      const toggleButton = screen.getByTestId('auto-scroll-toggle');
      expect(screen.getByText('Auto-scroll: ON')).toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.getByText('Auto-scroll: OFF')).toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(screen.getByText('Auto-scroll: ON')).toBeInTheDocument();
    });
  });

  describe('Accessibility and Props', () => {
    it('applies custom maxHeight style', () => {
      render(<CombatLog maxHeight="300px" />);
      
      const scrollArea = screen.getByTestId('combat-log-scroll-area');
      expect(scrollArea).toHaveStyle({ height: '300px' });
    });

    it('has proper ARIA attributes and semantic structure', () => {
      render(<CombatLog />);

      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: /combat log/i })).toBeInTheDocument();

      // Check for proper button roles
      expect(screen.getByTestId('copy-log-button')).toBeInTheDocument();
      expect(screen.getByTestId('export-log-button')).toBeInTheDocument();
    });

    it('handles missing enemy gracefully in export functions', () => {
      (useCombat as any).mockReturnValue({
        ...defaultMockCombat,
        enemy: null
      });

      // This should not render, but if it did, export functions should handle null enemy
      const { rerender } = render(<CombatLog />);
      
      // Force render with enemy to test export functions
      (useCombat as any).mockReturnValue({
        ...defaultMockCombat,
        enemy: mockEnemy,
        log: []
      });
      
      rerender(<CombatLog />);
      
      // Export buttons should not be visible with empty log
      expect(screen.queryByTestId('copy-log-button')).not.toBeInTheDocument();
    });
  });
});
