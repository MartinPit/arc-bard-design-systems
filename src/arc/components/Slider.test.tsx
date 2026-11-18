import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from './Slider';

describe('Slider', () => {
  it('preserves fractional values in its numeric output and native input', () => {
    render(<Slider label="Density" min={0} max={5} step={0.5} value={1.5} unit="%" onChange={vi.fn()} />);

    expect(screen.getByRole('slider', { name: 'Density' })).toHaveValue('1.5');
    expect(document.querySelector('output')).toHaveTextContent('1.5%');
    expect(document.querySelector('.arc-slider__limits')).toHaveTextContent('0%5%');
  });
});
