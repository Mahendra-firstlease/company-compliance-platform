import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

describe('Button Component', () => {
  it('renders button with label text', () => {
    render(<Button label="Click Me" />);
    expect(screen.getByRole('button', { name: 'Click Me' })).toBeInTheDocument();
  });

  it('renders button with children', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Clickable' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders loading spinner and disables button when loading is true', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button', { name: 'Disabled Button' })).toBeDisabled();
  });

  it('applies variant and size classes correctly', () => {
    const { container } = render(<Button variant="outline" size="sm">Small Outline</Button>);
    expect(container.firstChild).toHaveClass('border', 'border-primary', 'h-9', 'px-4');
  });

  it('renders left and right icons when provided', () => {
    render(
      <Button
        leftIcon={<span data-testid="left-icon">Icon L</span>}
        rightIcon={<span data-testid="right-icon">Icon R</span>}
      >
        Icon Button
      </Button>
    );
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByText('Icon Button')).toBeInTheDocument();
  });
});
