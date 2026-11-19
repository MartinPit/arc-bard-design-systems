import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Portal } from './Portal';

describe('Portal', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  it('links to each independent design system without rendering their components', () => {
    render(<Portal />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('One origin.Two visual languages.');
    expect(screen.getByRole('link', { name: 'Explore Arc design system' }).getAttribute('href')).toMatch(/\/arc\/$/);
    expect(screen.getByRole('link', { name: 'Open Arc Reading Room app prototype' }).getAttribute('href')).toMatch(/\/arc\/reading-room\/$/);
    expect(screen.getByRole('link', { name: 'Open Arc Flashcards app prototype' }).getAttribute('href')).toMatch(/\/arc\/flashcards\/$/);
    expect(screen.getByRole('link', { name: 'Explore Bard design system' }).getAttribute('href')).toMatch(/\/bard\/$/);
  });

  it('switches themes and remembers the explicit preference', async () => {
    const user = userEvent.setup();
    render(<Portal />);

    const darkToggle = screen.getByRole('button', { name: 'Switch to dark mode' });
    await user.click(darkToggle);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(window.localStorage.getItem('portal-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(window.localStorage.getItem('portal-theme')).toBe('light');
  });

  it('starts from the saved theme', () => {
    window.localStorage.setItem('portal-theme', 'dark');
    render(<Portal />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  });
});
