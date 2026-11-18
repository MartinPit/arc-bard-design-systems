import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as axe from 'axe-core';
import { ReadingRoom } from './ReadingRoom';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  cleanup();
  window.history.replaceState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
  try { window.localStorage.removeItem('arc-theme'); } catch { /* Storage may be unavailable. */ }
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.removeProperty('color-scheme');
  document.documentElement.classList.remove('arc-theme-changing');
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: originalMatchMedia });
});

describe('Arc Reading Room', () => {
  it('navigates to the library and finds, empties, and restores catalogue results', () => {
    render(<ReadingRoom />);
    fireEvent.click(screen.getByRole('link', { name: 'Library' }));
    expect(screen.getByRole('heading', { level: 1, name: 'The Library.' })).toBeInTheDocument();

    const search = screen.getByRole('searchbox', { name: 'Search your library' });
    fireEvent.change(search, { target: { value: 'Mina Sol' } });
    expect(screen.getByRole('heading', { name: 'A Field Guide to Yellow Light' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'The Orchard at Night' })).not.toBeInTheDocument();
    expect(screen.getByText('1 volume found')).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'not on this shelf' } });
    expect(screen.getByRole('heading', { name: 'No Books in This Corner' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Search and Filters' }));
    expect(search).toHaveValue('');
    expect(screen.getByText('6 volumes found')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Orchard at Night' })).toBeInTheDocument();
  });

  it('opens the reader, records chapter progress, and announces the update', async () => {
    render(<ReadingRoom />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue Reading The Cartographer of Quiet' }));
    const dialog = await screen.findByRole('dialog', { name: 'The Cartographer of Quiet' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByText(/Before the town learned to name its streets/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Mark Chapter Read' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('You Marked a Chapter Read')).toBeInTheDocument();
    expect(screen.getByText(/You read 59% of The Cartographer of Quiet/)).toBeInTheDocument();
    expect(screen.getByLabelText('Reading progress for The Cartographer of Quiet')).toHaveValue(59);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss You Marked a Chapter Read' }));
    expect(screen.queryByText('You Marked a Chapter Read')).not.toBeInTheDocument();
  });

  it('adds a reading note to the commonplace book', async () => {
    render(<ReadingRoom />);
    fireEvent.click(screen.getByRole('link', { name: 'Notes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add a Note' }));
    const dialog = await screen.findByRole('dialog', { name: 'Press a Thought into the Margin' });
    fireEvent.change(within(dialog).getByLabelText('Book'), { target: { value: 'yellow-light' } });
    fireEvent.change(within(dialog).getByLabelText('Your note'), { target: { value: 'Keep this image of light gathering the room.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save Note' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('Keep this image of light gathering the room.')).toBeInTheDocument();
    expect(screen.getByText('You Pressed a Note into the Margin')).toBeInTheDocument();
    const newEntry = screen.getByText('Keep this image of light gathering the room.').closest('article');
    expect(newEntry).not.toBeNull();
    expect(within(newEntry as HTMLElement).getByText('A Field Guide to Yellow Light')).toBeInTheDocument();
  });

  it('has no detectable axe accessibility violations in light mode', async () => {
    render(<ReadingRoom />);
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  }, 15000);

  it('has no detectable axe accessibility violations in dark mode', async () => {
    window.localStorage.setItem('arc-theme', 'dark');
    render(<ReadingRoom />);
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  }, 15000);
});
