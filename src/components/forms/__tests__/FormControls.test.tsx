import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from '../Input';
import Checkbox from '../Checkbox';
import FormGroup from '../FormGroup';
import FormLabel from '../FormLabel';
import FormError from '../FormError';
import FormDescription from '../FormDescription';
import PasswordInput from '../PasswordInput';
import Textarea from '../Textarea';
import Select, { UISelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../Select';

describe('Input Component', () => {
  it('renders input with value and handles change', () => {
    const handleChange = vi.fn();
    render(<Input value="Test Value" onChange={handleChange} placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
    expect(input.value).toBe('Test Value');
    fireEvent.change(input, { target: { value: 'New Value' } });
    expect(handleChange).toHaveBeenCalled();
  });
});

describe('Checkbox Component', () => {
  it('renders checkbox label and responds to check changes', () => {
    const handleChange = vi.fn();
    render(<Checkbox label="I agree to terms" checked={false} onChange={handleChange} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});

describe('Form Helper Components', () => {
  it('renders FormGroup with label, description, children, and error', () => {
    render(
      <FormGroup
        label="Email Address"
        required
        description="We will send invoice here"
        error="Invalid email address"
      >
        <Input placeholder="email@example.com" />
      </FormGroup>
    );
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('We will send invoice here')).toBeInTheDocument();
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });
});

describe('PasswordInput Component', () => {
  it('toggles password visibility when eye icon button is clicked', () => {
    render(<PasswordInput placeholder="Enter password" />);
    const input = screen.getByPlaceholderText('Enter password') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggleButton = screen.getByLabelText('Show password');
    fireEvent.click(toggleButton);
    expect(input.type).toBe('text');

    fireEvent.click(screen.getByLabelText('Hide password'));
    expect(input.type).toBe('password');
  });
});

describe('Textarea Component', () => {
  it('renders textarea with custom rows and value', () => {
    render(<Textarea rows={4} placeholder="Comments" defaultValue="Sample comment" />);
    const textarea = screen.getByPlaceholderText('Comments') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Sample comment');
  });
});

describe('Select Component', () => {
  const options = [
    { label: 'Private Limited', value: 'pvt_ltd' },
    { label: 'LLP', value: 'llp' },
  ];

  it('renders select component and opens options dropdown', () => {
    const handleChange = vi.fn();
    render(<Select label="Entity Type" options={options} value="pvt_ltd" onChange={handleChange} />);
    expect(screen.getByText('Entity Type')).toBeInTheDocument();
    expect(screen.getByText('Private Limited')).toBeInTheDocument();

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    expect(screen.getByText('LLP')).toBeInTheDocument();

    fireEvent.click(screen.getByText('LLP'));
    expect(handleChange).toHaveBeenCalledWith('llp');
  });
});
