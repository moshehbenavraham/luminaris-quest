/**
 * MIT License
 * Copyright (c) 2024 Luminari's Quest
 */

import { render, screen } from '@testing-library/react';
import { ActionTooltip } from '@/features/combat/components/actions/ActionTooltip';

describe('ActionTooltip', () => {
  it('renders trigger element', () => {
    render(
      <ActionTooltip title="Test Action" description="Test description">
        <button>Test Button</button>
      </ActionTooltip>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('renders with basic props without errors', () => {
    render(
      <ActionTooltip title="Illuminate" description="Shine light on your fears">
        <button>Action</button>
      </ActionTooltip>
    );
    
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders with cost information without errors', () => {
    render(
      <ActionTooltip 
        title="Illuminate" 
        description="Test description"
        cost={{ lp: 2, sp: 1 }}
      >
        <button>Action</button>
      </ActionTooltip>
    );
    
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders with zero costs without errors', () => {
    render(
      <ActionTooltip 
        title="Endure" 
        description="Test description"
        cost={{ lp: 0, sp: 0 }}
      >
        <button>Action</button>
      </ActionTooltip>
    );
    
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders with shortcut key without errors', () => {
    render(
      <ActionTooltip 
        title="Illuminate" 
        description="Test description"
        shortcut="1"
      >
        <button>Action</button>
      </ActionTooltip>
    );
    
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders in disabled state without errors', () => {
    render(
      <ActionTooltip 
        title="Illuminate" 
        description="Test description"
        disabled={true}
      >
        <button>Action</button>
      </ActionTooltip>
    );
    
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders with all props without errors', () => {
    render(
      <ActionTooltip 
        title="Illuminate" 
        description="Test description"
        cost={{ lp: 2 }}
        shortcut="1"
        disabled={true}
      >
        <button>Action</button>
      </ActionTooltip>
    );
    
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders without cost section when no cost provided', () => {
    render(
      <ActionTooltip title="Endure" description="Build resilience">
        <button>Action</button>
      </ActionTooltip>
    );
    
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});