import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSpinner from '../LoadingSpinner';
import Container from '../Container';
import Section from '../Section';
import Breadcrumb from '../Breadcrumb';
import CompanyLogo from '../CompanyLogo';

describe('LoadingSpinner Component', () => {
  it('renders loading text and spinner icon', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('Container & Section Components', () => {
  it('renders Container children correctly', () => {
    render(
      <Container className="custom-class">
        <span>Container Content</span>
      </Container>
    );
    expect(screen.getByText('Container Content')).toBeInTheDocument();
  });

  it('renders Section children correctly', () => {
    render(
      <Section className="section-class">
        <div>Section Content</div>
      </Section>
    );
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });
});

describe('Breadcrumb Component', () => {
  it('renders home icon link and breadcrumb items', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Services', href: '/services' },
          { label: 'GST Filing' },
        ]}
      />
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('GST Filing')).toBeInTheDocument();
  });
});

describe('CompanyLogo Component', () => {
  it('renders company logo image', () => {
    render(<CompanyLogo priority />);
    expect(screen.getAllByAltText(/Company/i).length).toBeGreaterThan(0);
  });
});
