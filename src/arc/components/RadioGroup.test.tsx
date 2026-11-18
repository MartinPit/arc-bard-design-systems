import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RadioGroup } from './RadioGroup';

const options = [{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }];

describe('RadioGroup', () => {
  it('keeps one polite inline live region associated through error changes', () => {
    const { rerender } = render(<RadioGroup label="Digest cadence" name="cadence" options={options} value="weekly" onChange={() => undefined} />);
    const group = screen.getByRole('group', { name: 'Digest cadence' });
    const messageId = group.getAttribute('aria-describedby');
    expect(messageId).toBeTruthy();
    const region = document.getElementById(messageId!);
    expect(region).toHaveAttribute('role', 'status');
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');
    expect(region).toBeEmptyDOMElement();

    rerender(<RadioGroup label="Digest cadence" name="cadence" options={options} value="weekly" onChange={() => undefined} error="Choose a digest cadence." />);
    expect(document.getElementById(messageId!)).toBe(region);
    expect(region).toHaveTextContent('Choose a digest cadence.');
    expect(region).toHaveClass('arc-field__message--error');

    rerender(<RadioGroup label="Digest cadence" name="cadence" options={options} value="weekly" onChange={() => undefined} />);
    expect(document.getElementById(messageId!)).toBe(region);
    expect(region).toBeEmptyDOMElement();
  });
});
