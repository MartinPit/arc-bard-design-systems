import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { BardShowcase } from './BardShowcase';

const componentHeadings = [
  'Button',
  'Icon Button',
  'Text Input',
  'Textarea',
  'Select',
  'Checkbox',
  'Radio Group',
  'Switch',
  'Slider',
  'Tabs',
  'Dialog',
  'Popover',
  'Tooltip',
  'Toast',
  'Badge',
  'Avatar',
  'Card',
  'Table',
  'Pagination',
];

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = '';
  document.documentElement.classList.remove('bard-theme-changing');

  vi.stubGlobal('IntersectionObserver', ObserverStub);
  vi.stubGlobal('ResizeObserver', ObserverStub);
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));

  if (!window.PointerEvent) {
    vi.stubGlobal('PointerEvent', MouseEvent);
  }

  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = '';
  document.documentElement.classList.remove('bard-theme-changing');
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('BardShowcase', () => {
  it('has one exact h1 and all nineteen component headings', () => {
    render(<BardShowcase />);

    const h1 = screen.getByRole('heading', { level: 1, name: 'Bard' });
    expect(h1).toHaveTextContent(/^Bard$/);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

    const catalog = within(document.getElementById('components')!);
    for (const heading of componentHeadings) {
      expect(catalog.getByRole('heading', { level: 3, name: heading })).toBeInTheDocument();
    }
    expect(componentHeadings).toHaveLength(19);
    expect(document.querySelectorAll('.bard-specimen')).toHaveLength(19);
  });

  it('provides expandable React code for every component', async () => {
    const user = userEvent.setup();
    render(<BardShowcase />);

    const disclosures = document.querySelectorAll<HTMLDetailsElement>('.bard-code');
    expect(disclosures).toHaveLength(19);
    expect(disclosures[0].open).toBe(false);
    await user.click(screen.getAllByText('React code')[0]);
    expect(disclosures[0].open).toBe(true);
    expect(disclosures[0]).toHaveTextContent('<Button>Compose</Button>');
  });

  it('switches Base UI tab panels with pointer and keyboard interaction', async () => {
    const user = userEvent.setup();
    render(<BardShowcase />);

    const intent = screen.getByRole('tab', { name: 'Intent' });
    const anatomy = screen.getByRole('tab', { name: 'Anatomy' });
    const tokens = screen.getByRole('tab', { name: 'Tokens' });
    expect(intent).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Intent' })).toHaveTextContent('Start with the reason a surface exists.');

    await user.click(anatomy);
    expect(anatomy).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Anatomy' })).toHaveTextContent('A fine rule separates the heading');

    anatomy.focus();
    await user.keyboard('{ArrowRight}');
    expect(tokens).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(tokens).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Tokens' })).toHaveTextContent('--bard-radius-lg: 1.75rem');
  });

  it('opens an accessible dialog, closes with Escape, and returns focus', async () => {
    const user = userEvent.setup();
    render(<BardShowcase />);

    const trigger = screen.getByRole('button', { name: 'Open dialog' });
    trigger.focus();
    await user.click(trigger);

    const dialog = await screen.findByRole('dialog', { name: 'Keep the whole composition in view.' });
    expect(dialog).toHaveAccessibleDescription('Dialogs are for a single, consequential decision. Return focus to the invoking control when the moment has passed.');
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('toggles the switch by click and keyboard', async () => {
    const user = userEvent.setup();
    render(<BardShowcase />);

    const switchControl = screen.getByRole('switch', { name: 'Ambient linework' });
    expect(switchControl).toBeChecked();
    await user.click(switchControl);
    expect(switchControl).not.toBeChecked();
    switchControl.focus();
    await user.keyboard(' ');
    await waitFor(() => expect(switchControl).toBeChecked());
  });

  it('shows and dismisses a polite toast without moving focus', async () => {
    const user = userEvent.setup();
    render(<BardShowcase />);

    const showButton = screen.getByRole('button', { name: 'Show confirmation' });
    await user.click(showButton);
    const toastTitle = await screen.findByText('Changes preserved');
    const toast = toastTitle.closest('[role="status"]');
    expect(toast).toHaveTextContent('Your preferences are saved on this device.');
    expect(showButton).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByText('Changes preserved')).not.toBeInTheDocument();
  });

  it('filters resources to a useful empty state and recovers', async () => {
    const user = userEvent.setup();
    render(<BardShowcase />);

    const filter = screen.getByRole('searchbox', { name: 'Filter resources' });
    expect(screen.getByRole('table', { name: 'Design-system resources' })).toBeInTheDocument();
    await user.type(filter, 'no-such-resource');

    expect(screen.queryByRole('table', { name: 'Design-system resources' })).not.toBeInTheDocument();
    expect(screen.getByText('No resources match “no-such-resource”').closest('[role="status"]')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filter' }));

    expect(filter).toHaveValue('');
    expect(screen.getByRole('table', { name: 'Design-system resources' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Dialog' })).toBeInTheDocument();
  });

  it('switches themes with exact accessible names and persists the explicit choice', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<BardShowcase />);

    const darkToggle = screen.getByRole('button', { name: 'Switch to dark mode' });
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement).toHaveStyle({ colorScheme: 'light' });

    await user.click(darkToggle);
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toHaveAttribute('data-theme-toggle', 'dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement).toHaveStyle({ colorScheme: 'dark' });
    expect(window.localStorage.getItem('bard-theme')).toBe('dark');

    unmount();
    render(<BardShowcase />);
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(window.localStorage.getItem('bard-theme')).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });

  it('uses a saved dark preference instead of the operating system preference', () => {
    window.localStorage.setItem('bard-theme', 'dark');
    render(<BardShowcase />);

    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('follows operating system changes only until a theme is explicitly chosen', async () => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener)),
      removeEventListener: vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener)),
      dispatchEvent: vi.fn(),
    })));
    const user = userEvent.setup();
    render(<BardShowcase />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    act(() => listeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent)));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
    expect(window.localStorage.getItem('bard-theme')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(listeners.size).toBe(0);
    act(() => listeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent)));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('bard-theme')).toBe('dark');
  });

  it('keeps theme controls usable when matchMedia and localStorage are unavailable', async () => {
    vi.stubGlobal('matchMedia', undefined);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    const user = userEvent.setup();

    expect(() => render(<BardShowcase />)).not.toThrow();
    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });

  it('renders when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    expect(() => render(<BardShowcase />)).not.toThrow();
    expect(screen.getByRole('heading', { level: 1, name: 'Bard' })).toBeInTheDocument();
  });

  it('passes an axe-core accessibility audit', async () => {
    const { container } = render(<BardShowcase />);
    const results = await axe.run(container, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
      },
    });

    expect(results.violations).toEqual([]);
  }, 20000);
});
