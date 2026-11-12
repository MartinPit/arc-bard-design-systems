import { render, screen } from '@testing-library/react';

import { Portal } from './Portal';

describe('Portal', () => {
  it('links to each independent design system without rendering their components', () => {
    render(<Portal />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('One origin.Two visual languages.');
    expect(screen.getByRole('link', { name: 'Explore Arc design system' }).getAttribute('href')).toMatch(/\/arc\/$/);
    expect(screen.getByRole('link', { name: 'Explore Bard design system' }).getAttribute('href')).toMatch(/\/bard\/$/);
  });
});
