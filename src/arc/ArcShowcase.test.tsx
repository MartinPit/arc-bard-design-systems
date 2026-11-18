import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as axe from 'axe-core';
import { ArcShowcase } from './ArcShowcase';

const componentNames = [
  'Button', 'Icon Button', 'Text Input', 'Textarea', 'Select', 'Checkbox', 'Radio Group',
  'Switch', 'Slider', 'Tabs', 'Dialog', 'Popover', 'Tooltip', 'Toast', 'Badge', 'Avatar',
  'Card', 'Table', 'Pagination',
];

const originalMatchMedia = window.matchMedia;

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const query = {
    get matches() { return matches; },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => { listeners.add(listener); },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => { listeners.delete(listener); },
    addListener: (listener: (event: MediaQueryListEvent) => void) => { listeners.add(listener); },
    removeListener: (listener: (event: MediaQueryListEvent) => void) => { listeners.delete(listener); },
    dispatchEvent: () => true,
  };
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: () => query });
  return {
    emit(value: boolean) {
      matches = value;
      listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent));
    },
    listenerCount: () => listeners.size,
  };
}

afterEach(() => {
  cleanup();
  try { window.localStorage.removeItem('arc-theme'); } catch { /* Storage may be unavailable. */ }
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.removeProperty('color-scheme');
  document.documentElement.classList.remove('arc-theme-changing');
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: originalMatchMedia });
  window.history.replaceState(null, '', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
});

describe('ArcShowcase', () => {
  it('renders the Arc identity and all nineteen component specimens', () => {
    const { container } = render(<ArcShowcase />);
    expect(screen.getByRole('heading', { level: 1, name: 'Arc' })).toBeTruthy();
    expect(container.querySelector('[data-design-system="arc"]')).toBeTruthy();
    componentNames.forEach((name) => {
      expect(screen.getByRole('heading', { level: 3, name })).toBeTruthy();
    });
    expect(screen.getByRole('navigation', { name: 'Design system sections' })).toBeTruthy();
  });

  it('exposes meaningful artwork, the type scale, and the component index semantically', () => {
    render(<ArcShowcase />);

    expect(screen.getByRole('img', { name: 'Arc accent gradient, marigold through orange and coral to magenta' })).toBeTruthy();
    const typeScale = screen.getByRole('list', { name: 'Recommended type scale' });
    expect(within(typeScale).getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByRole('navigation', { name: 'Component index' })).toBeTruthy();
  });

  it('keeps button icons and labels in the shared content wrapper', () => {
    render(<ArcShowcase />);
    const create = screen.getByRole('button', { name: 'Create a Collection' });
    const createContent = create.querySelector(':scope > .arc-button__content');
    expect(createContent).toBeTruthy();
    expect(createContent?.querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Explore Components' }).querySelector('.arc-button__content svg')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    const saving = screen.getByRole('button', { name: 'Saving Changes…' });
    expect(saving.querySelector(':scope > .arc-button__loader')).toBeTruthy();
    expect(saving.querySelector(':scope > .arc-button__content')).toBeTruthy();
  });

  it('selects tabs by click and arrow keys', () => {
    render(<ArcShowcase />);
    const overview = screen.getByRole('tab', { name: 'Overview' });
    const notes = screen.getByRole('tab', { name: 'Field Notes' });
    fireEvent.click(notes);
    expect(notes.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toContain('Observations in Context');
    fireEvent.keyDown(notes, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'History' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(overview, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'History' }).getAttribute('aria-selected')).toBe('true');
  });

  it('opens an accessible dialog, receives focus, and closes with Escape', async () => {
    render(<ArcShowcase />);
    const trigger = screen.getByRole('button', { name: 'Create a Collection' });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Create a Collection' });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByLabelText(/Collection name/)));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('updates switch state and exposes its current value', () => {
    render(<ArcShowcase />);
    const control = screen.getByRole('switch', { name: /Revision notifications/ });
    expect((control as HTMLInputElement).checked).toBe(true);
    fireEvent.click(control);
    expect((control as HTMLInputElement).checked).toBe(false);
    expect(screen.getByText('Notifications are off.')).toBeTruthy();
  });

  it('adds and dismisses a status toast without taking focus', async () => {
    render(<ArcShowcase />);
    const trigger = screen.getByRole('button', { name: 'Show Success Toast' });
    trigger.focus();
    fireEvent.click(trigger);
    const message = await screen.findByText('You Saved Changes');
    expect(message.closest('[role="status"]')?.textContent).toContain('Your local edits are ready to review.');
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss You Saved Changes' }));
    expect(screen.queryByText('You Saved Changes')).toBeNull();
  });

  it('supports local filtering, including an empty state and recovery', () => {
    render(<ArcShowcase />);
    const filter = screen.getByRole('searchbox', { name: 'Filter resources' });
    fireEvent.change(filter, { target: { value: 'not-a-resource' } });
    expect(screen.getByRole('heading', { name: 'No Matching Resources' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear Filter' }));
    expect((filter as HTMLInputElement).value).toBe('');
    expect(screen.getByText('Principles of Clear Revision')).toBeTruthy();
  });

  it('honors a saved preference and persists explicit theme choices', () => {
    mockMatchMedia(false);
    window.localStorage.setItem('arc-theme', 'dark');
    render(<ArcShowcase />);

    const toggle = screen.getByRole('button', { name: 'Switch to Light Mode' });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Copy Paper token #171019' })).toBeTruthy();

    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Switch to Dark Mode' })).toBeTruthy();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem('arc-theme')).toBe('light');
    expect(screen.getByRole('button', { name: 'Copy Paper token #F4EFE4' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Dark Mode' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem('arc-theme')).toBe('dark');
  });

  it('follows OS theme changes only until an explicit choice is made', () => {
    const media = mockMatchMedia(true);
    render(<ArcShowcase />);
    expect(screen.getByRole('button', { name: 'Switch to Light Mode' })).toBeTruthy();
    expect(media.listenerCount()).toBe(1);

    act(() => media.emit(false));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to Dark Mode' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Switch to Dark Mode' }));
    expect(media.listenerCount()).toBe(0);
    expect(window.localStorage.getItem('arc-theme')).toBe('dark');
    act(() => media.emit(false));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('has no detectable axe accessibility violations', async () => {
    render(<ArcShowcase />);
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  }, 15000);

  it('has no detectable axe accessibility violations in dark mode', async () => {
    window.localStorage.setItem('arc-theme', 'dark');
    render(<ArcShowcase />);
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  }, 15000);
});
