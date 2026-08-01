import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QueryResponseModal from '../QueryResponseModal';
import { ApplicationCase } from '@/lib/applications';

// Mock updateApplication
vi.mock('@/lib/applications', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    updateApplication: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe('QueryResponseModal Component', () => {
  const mockApp: ApplicationCase = {
    id: 'COMP-TEST-123',
    customerName: 'Test Client',
    customerPhone: '+919876543210',
    serviceSlug: 'gst-registration',
    serviceTitle: 'GST Registration',
    status: 'DOCUMENTS_PENDING',
    createdAt: '2026-08-01T12:00:00Z',
    uploadedDocs: {},
    query: 'Address proof unreadable. Please upload utility bill.',
    assignedExecutive: 'Anjali Gupta',
  };

  it('renders correctly when open with active query text', () => {
    render(
      <QueryResponseModal
        application={mockApp}
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.getByText('Respond to Specialist Query')).toBeInTheDocument();
    expect(screen.getByText(/Address proof unreadable/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <QueryResponseModal
        application={mockApp}
        isOpen={false}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    expect(screen.queryByText('Respond to Specialist Query')).not.toBeInTheDocument();
  });

  it('handles client written reply submission', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <QueryResponseModal
        application={mockApp}
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Re-uploaded latest electricity bill.' } });

    const submitBtn = screen.getByText('Submit Response to Officer');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
