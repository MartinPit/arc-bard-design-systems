import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as axe from 'axe-core';
import { Flashcards } from './Flashcards';
import { LIBRARY_STORAGE_KEY, SESSION_STORAGE_KEY } from './persistence';

const previousTheme = window.localStorage.getItem('arc-theme');

beforeEach(() => {
  window.localStorage.removeItem(LIBRARY_STORAGE_KEY);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  window.history.replaceState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
});

afterEach(() => {
  window.localStorage.removeItem(LIBRARY_STORAGE_KEY);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  if (previousTheme === null) window.localStorage.removeItem('arc-theme');
  else window.localStorage.setItem('arc-theme', previousTheme);
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.removeProperty('color-scheme');
  window.history.replaceState({}, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
});

describe('Arc Flashcards app', () => {
  it('persists current card state, suspends, and resumes one selected session', async () => {
    render(<Flashcards />);
    fireEvent.click(screen.getByRole('button', { name: /Practice this set/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Set up practice.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '12 eligible cards' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Start practice/ }));
    fireEvent.click(screen.getByRole('button', { name: /Known/ }));
    fireEvent.click(screen.getByRole('button', { name: /Save & suspend/ }));
    expect(screen.getByText('One paused session')).toBeInTheDocument();
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) ?? '{}');
      expect(saved.known).toBe(1);
      expect(saved.currentIndex).toBe(1);
      expect(saved.revealed).toBe(false);
    });
    fireEvent.click(screen.getByRole('button', { name: /Resume practice/ }));
    expect(screen.getByText('木')).toBeInTheDocument();
    expect(screen.getByText('Card 2 of 10 in this batch')).toBeInTheDocument();
  });

  it('switches the study stage to another set and previews only configured fields', () => {
    render(<Flashcards />);
    const japanesePreview = screen.getByRole('article', { name: 'Preview of Japanese essentials, card 1' });
    expect(japanesePreview).toHaveTextContent('mizu');
    expect(japanesePreview).not.toHaveTextContent('water');

    fireEvent.click(screen.getByRole('link', { name: /Human anatomy/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Human anatomy' })).toBeInTheDocument();
    expect(window.location.search).toContain('stage=human-anatomy');
    const anatomyPreview = screen.getByRole('article', { name: 'Preview of Human anatomy, card 1' });
    expect(anatomyPreview).toHaveTextContent('Femur');
    expect(anatomyPreview).toHaveTextContent('The thigh bone');
  });

  it('asks before replacing an existing session when another practice starts', async () => {
    render(<Flashcards />);
    fireEvent.click(screen.getByRole('button', { name: /Practice this set/ }));
    fireEvent.click(screen.getByRole('button', { name: /Start practice/ }));
    fireEvent.click(screen.getByRole('button', { name: /Save & suspend/ }));
    fireEvent.click(screen.getByRole('button', { name: /Practice this set/ }));
    fireEvent.click(screen.getByRole('button', { name: /Start practice/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Replace your paused session?' });
    expect(dialog).toHaveTextContent('Only one practice session can be active.');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.location.search).toContain('setup=1');
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) ?? '{}').known).toBe(0);
  });

  it('protects an unsaved editor draft during in-app navigation', async () => {
    render(<Flashcards />);
    fireEvent.click(screen.getByRole('button', { name: 'New set' }));
    fireEvent.change(screen.getByLabelText('Card 1, Front'), { target: { value: 'Do not lose this' } });
    fireEvent.click(screen.getByRole('link', { name: 'Arc Flashcards study desk' }));
    const dialog = await screen.findByRole('dialog', { name: 'Leave this unsaved draft?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByLabelText('Card 1, Front')).toHaveValue('Do not lose this');
  });

  it('has no detectable axe accessibility violations in light mode', async () => {
    render(<Flashcards />);
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  }, 15000);

  it('has no detectable axe accessibility violations in dark mode', async () => {
    window.localStorage.setItem('arc-theme', 'dark');
    render(<Flashcards />);
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  }, 15000);
});
