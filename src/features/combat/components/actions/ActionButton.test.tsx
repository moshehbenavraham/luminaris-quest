/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButton } from '@/features/combat/components/actions/ActionButton';
import { vi } from 'vitest';

describe('ActionButton', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders with basic props', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Shine light on fears"
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Illuminate')).toBeInTheDocument();
    expect(screen.getByTestId('action-illuminate')).toBeInTheDocument();
  });

  it('displays action icon', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        onClick={mockOnClick}
      />
    );

    // Should show default icon for ILLUMINATE
    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('displays custom icon when provided', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        icon="🌟"
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('🌟')).toBeInTheDocument();
    expect(screen.queryByText('✨')).not.toBeInTheDocument();
  });

  it('displays cost information', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        cost={{ lp: 2, sp: 1 }}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('2LP')).toBeInTheDocument();
    expect(screen.getByText('1SP')).toBeInTheDocument();
  });

  it('displays shortcut key', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        shortcut="1"
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onClick when clicked and not disabled', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        onClick={mockOnClick}
      />
    );

    fireEvent.click(screen.getByTestId('action-illuminate'));
    expect(mockOnClick).toHaveBeenCalledWith('ILLUMINATE');
  });

  it('does not call onClick when disabled', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        disabled={true}
        onClick={mockOnClick}
      />
    );

    fireEvent.click(screen.getByTestId('action-illuminate'));
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies disabled styling when disabled', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        disabled={true}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByTestId('action-illuminate');
    expect(button).toHaveClass('cursor-not-allowed', 'opacity-60');
    expect(button).toBeDisabled();
  });

  it('applies active styling when active', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        isActive={true}
        onClick={mockOnClick}
      />
    );

    const button = screen.getByTestId('action-illuminate');
    expect(button).toHaveClass('scale-105');
  });

  it('has proper accessibility attributes', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        shortcut="1"
        onClick={mockOnClick}
      />
    );

    const button = screen.getByTestId('action-illuminate');
    expect(button).toHaveAttribute('aria-label', 'Illuminate (1)');
  });

  it('applies different styles for different actions', () => {
    const { rerender } = render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        onClick={mockOnClick}
      />
    );

    let button = screen.getByTestId('action-illuminate');
    expect(button).toHaveClass('text-yellow-100');

    rerender(
      <ActionButton
        action="REFLECT"
        title="Reflect"
        description="Test description"
        onClick={mockOnClick}
      />
    );

    button = screen.getByTestId('action-reflect');
    expect(button).toHaveClass('text-blue-100');
  });

  it('displays only LP cost when only LP is provided', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        cost={{ lp: 2 }}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('2LP')).toBeInTheDocument();
    expect(screen.queryByText('SP')).not.toBeInTheDocument();
  });

  it('does not display cost section when cost is zero', () => {
    render(
      <ActionButton
        action="ENDURE"
        title="Endure"
        description="Test description"
        cost={{ lp: 0, sp: 0 }}
        onClick={mockOnClick}
      />
    );

    expect(screen.queryByText('LP')).not.toBeInTheDocument();
    expect(screen.queryByText('SP')).not.toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(
      <ActionButton
        action="ILLUMINATE"
        title="Illuminate"
        description="Test description"
        onClick={mockOnClick}
        className="custom-class"
      />
    );

    expect(screen.getByTestId('action-illuminate')).toHaveClass('custom-class');
  });
});