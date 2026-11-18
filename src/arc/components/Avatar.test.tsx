import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('uses a visible and accessible fallback for empty and whitespace-only names', () => {
    const { rerender } = render(<Avatar name="" />);

    expect(screen.getByRole('img', { name: 'Unknown person' })).toHaveTextContent('?');

    rerender(<Avatar name="   " marked />);
    expect(screen.getByRole('img', { name: 'Unknown person, available' })).toHaveTextContent('?');

    rerender(<Avatar name="  Ada Lovelace  " />);
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL');
  });
});
