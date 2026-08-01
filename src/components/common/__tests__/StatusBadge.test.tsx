import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('renders correctly for APPROVED status', () => {
    render(<StatusBadge status="APPROVED" />);
    expect(screen.getByText('Approved & Issued')).toBeInTheDocument();
  });

  it('renders correctly for PENDING status', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Pending Verification')).toBeInTheDocument();
  });

  it('renders correctly for REJECTED status', () => {
    render(<StatusBadge status="REJECTED" />);
    expect(screen.getByText('Rejected / Defective')).toBeInTheDocument();
  });

  it('renders fallback for unknown status key', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText('UNKNOWN_STATUS')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { container } = render(<StatusBadge status="APPROVED" size="sm" />);
    expect(container.firstChild).toHaveClass('text-[10px]');
  });
});
