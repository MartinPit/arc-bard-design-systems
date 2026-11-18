import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('keeps one polite inline live region associated through message changes', () => {
    const { rerender } = render(<TextInput label="Resource title" />);
    const input = screen.getByRole('textbox', { name: 'Resource title' });
    const messageId = input.getAttribute('aria-describedby');
    expect(messageId).toBeTruthy();
    const region = document.getElementById(messageId!);
    expect(region).toHaveAttribute('role', 'status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region).toBeEmptyDOMElement();

    rerender(<TextInput label="Resource title" error="Use at least 4 characters." />);
    expect(document.getElementById(messageId!)).toBe(region);
    expect(region).toHaveTextContent('Use at least 4 characters.');
    expect(region).toHaveClass('arc-field__message--error');

    rerender(<TextInput label="Resource title" success="Title is available" />);
    expect(document.getElementById(messageId!)).toBe(region);
    expect(region).toHaveTextContent('Title is available');
    expect(region).toHaveClass('arc-field__message--success');
  });
});
