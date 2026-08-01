import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SectionHeading from '../Heading';
import SearchBar from '../SearchBar';

describe('SectionHeading Component', () => {
  it('renders title, highlight, badge and description correctly', () => {
    render(
      <SectionHeading
        badge="Popular"
        title="Our Business"
        highlight="Services"
        description="Comprehensive filings"
      />
    );
    expect(screen.getByText('Popular')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive filings')).toBeInTheDocument();
  });
});

describe('SearchBar Component', () => {
  it('renders input with value and placeholder', () => {
    const handleChange = vi.fn();
    render(
      <SearchBar
        value="GST"
        onChange={handleChange}
        placeholder="Search here"
      />
    );
    const input = screen.getByPlaceholderText('Search here') as HTMLInputElement;
    expect(input.value).toBe('GST');
  });

  it('triggers onChange when input text changes', () => {
    const handleChange = vi.fn();
    render(
      <SearchBar
        value=""
        onChange={handleChange}
        placeholder="Search here"
      />
    );
    const input = screen.getByPlaceholderText('Search here');
    fireEvent.change(input, { target: { value: 'Trademark' } });
    expect(handleChange).toHaveBeenCalledWith('Trademark');
  });

  it('shows clear button when value is present and triggers clear', () => {
    const handleChange = vi.fn();
    const handleClear = vi.fn();
    render(
      <SearchBar
        value="Search Term"
        onChange={handleChange}
        onClear={handleClear}
      />
    );
    const clearButton = screen.getByLabelText('Clear search input');
    expect(clearButton).toBeInTheDocument();
    fireEvent.click(clearButton);
    expect(handleChange).toHaveBeenCalledWith('');
    expect(handleClear).toHaveBeenCalled();
  });

  it('triggers onSearch on Enter key press', () => {
    const handleSearch = vi.fn();
    render(
      <SearchBar
        value="Compliance"
        onChange={vi.fn()}
        onSearch={handleSearch}
      />
    );
    const input = screen.getByDisplayValue('Compliance');
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(handleSearch).toHaveBeenCalledWith('Compliance');
  });
});
