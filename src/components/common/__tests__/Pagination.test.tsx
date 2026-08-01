import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Pagination from '../Pagination';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/test',
  useSearchParams: () => new URLSearchParams(),
}));

describe('Pagination Component', () => {
  it('returns null if totalPages <= 1', () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders pages correctly when totalPages > 1', () => {
    render(<Pagination currentPage={1} totalPages={5} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByLabelText('Next Page')).toBeInTheDocument();
  });

  it('calls onPageChange when a page number or Next is clicked', () => {
    const handlePageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={handlePageChange} />);
    
    const nextPageBtn = screen.getByLabelText('Next Page');
    fireEvent.click(nextPageBtn);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
