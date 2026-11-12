import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
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
