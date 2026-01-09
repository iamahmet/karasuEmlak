import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnhancedEmptyState } from '../EnhancedEmptyState';

describe('EnhancedEmptyState', () => {
  it('renders title and description', () => {
    render(
      <EnhancedEmptyState
        title="Test Title"
        description="Test Description"
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(
      <EnhancedEmptyState
        title="Test Title"
        description="Test Description"
        action={{ label: 'Test Action', href: '/test' }}
      />
    );
    expect(screen.getByText('Test Action')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;
    render(
      <EnhancedEmptyState
        title="Test Title"
        description="Test Description"
        icon={<CustomIcon />}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
