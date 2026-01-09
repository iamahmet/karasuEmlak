import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';

describe('FormField', () => {
  it('renders label', () => {
    render(
      <FormField label="Test Label">
        <input type="text" />
      </FormField>
    );
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('shows required asterisk when required', () => {
    render(
      <FormField label="Test Label" required>
        <input type="text" />
      </FormField>
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <FormField label="Test Label" error="Test error">
        <input type="text" />
      </FormField>
    );
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('displays hint text', () => {
    render(
      <FormField label="Test Label" hint="Test hint">
        <input type="text" />
      </FormField>
    );
    expect(screen.getByText('Test hint')).toBeInTheDocument();
  });
});
