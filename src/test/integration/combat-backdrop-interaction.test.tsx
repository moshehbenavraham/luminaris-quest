/**
 * Test for Combat Backdrop Interaction Fix
 *
 * This test verifies that the combat backdrop doesn't interfere with user interactions
 * by ensuring the backdrop layer has pointer-events: none
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CombatBackdrop } from '@/features/combat/components/CombatBackdrop';

describe('CombatBackdrop Interaction Fix', () => {
  it('should have pointer-events-none on backdrop layer to prevent interaction blocking', () => {
    const TestContent = () => <div data-testid="combat-content">Combat Content</div>;

    render(
      <CombatBackdrop isActive={true}>
        <TestContent />
      </CombatBackdrop>,
    );

    // Find the backdrop layer (should be the div with backdrop-blur-sm)
    const backdropLayer = document.querySelector('.backdrop-blur-sm');
    expect(backdropLayer).toBeInTheDocument();

    // Verify the backdrop layer has pointer-events-none class
    expect(backdropLayer).toHaveClass('pointer-events-none');

    // Verify the content is still rendered
    expect(screen.getByTestId('combat-content')).toBeInTheDocument();
  });

  it('should not render when isActive is false', () => {
    const TestContent = () => <div data-testid="combat-content">Combat Content</div>;

    render(
      <CombatBackdrop isActive={false}>
        <TestContent />
      </CombatBackdrop>,
    );

    // No backdrop or content should be rendered when inactive
    expect(document.querySelector('.backdrop-blur-sm')).not.toBeInTheDocument();
    expect(screen.queryByTestId('combat-content')).not.toBeInTheDocument();
  });

  it('should have proper z-index layering', () => {
    const TestContent = () => <div data-testid="combat-content">Combat Content</div>;

    render(
      <CombatBackdrop isActive={true}>
        <TestContent />
      </CombatBackdrop>,
    );

    const backdropLayer = document.querySelector('.z-combat-backdrop');
    const contentLayer = document.querySelector('.z-combat-content');

    expect(backdropLayer).toBeInTheDocument();
    expect(contentLayer).toBeInTheDocument();

    // Verify both layers have their expected z-index classes
    expect(backdropLayer).toHaveClass('z-combat-backdrop');
    expect(contentLayer).toHaveClass('z-combat-content');
  });
});
