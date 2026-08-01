import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('renders correctly for APPROVED status', () => {
    render(<StatusBadge status="APPROVED" />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders correctly for PENDING status', () => {
    render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders correctly for REJECTED status', () => {
    render(<StatusBadge status="REJECTED" />);
    expect(screen.getByText('Rejected')).toBeInTheDocument();
  });

  it('renders correctly for QUERY_RAISED status', () => {
    render(<StatusBadge status="QUERY_RAISED" />);
    expect(screen.getByText('Query Active')).toBeInTheDocument();
  });

  it('renders correctly for CLIENT_RESPONDED status', () => {
    render(<StatusBadge status="CLIENT_RESPONDED" />);
    expect(screen.getByText('Client Responded')).toBeInTheDocument();
  });

  it('renders fallback for unknown status key', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText('UNKNOWN STATUS')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { container } = render(<StatusBadge status="APPROVED" size="sm" />);
    expect(container.firstChild).toHaveClass('text-[10px]');
  });
});
