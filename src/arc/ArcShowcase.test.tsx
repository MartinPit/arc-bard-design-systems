import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import * as axe from 'axe-core';
import { ArcShowcase } from './ArcShowcase';

const componentNames = [
  'Button', 'Icon Button', 'Text Input', 'Textarea', 'Select', 'Checkbox', 'Radio Group',
  'Switch', 'Slider', 'Tabs', 'Dialog', 'Popover', 'Tooltip', 'Toast', 'Badge', 'Avatar',
  'Card', 'Table', 'Pagination',
];

afterEach(() => cleanup());

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

  it('selects tabs by click and arrow keys', () => {
    render(<ArcShowcase />);
    const overview = screen.getByRole('tab', { name: 'Overview' });
    const notes = screen.getByRole('tab', { name: 'Field notes' });
    fireEvent.click(notes);
    expect(notes.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toContain('Observations in context');
    fireEvent.keyDown(notes, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'History' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(overview, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'History' }).getAttribute('aria-selected')).toBe('true');
  });

  it('opens an accessible dialog, receives focus, and closes with Escape', async () => {
    render(<ArcShowcase />);
    const trigger = screen.getByRole('button', { name: 'Create a collection' });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Create a collection' });
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
    const trigger = screen.getByRole('button', { name: 'Show success toast' });
    trigger.focus();
    fireEvent.click(trigger);
    const message = await screen.findByText('Changes preserved');
    expect(message.closest('[role="status"]')?.textContent).toContain('Your local edits are ready to review.');
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss Changes preserved' }));
    expect(screen.queryByText('Changes preserved')).toBeNull();
  });

  it('supports local filtering, including an empty state and recovery', () => {
    render(<ArcShowcase />);
    const filter = screen.getByRole('searchbox', { name: 'Filter resources' });
    fireEvent.change(filter, { target: { value: 'not-a-resource' } });
    expect(screen.getByRole('heading', { name: 'No matching resources' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filter' }));
    expect((filter as HTMLInputElement).value).toBe('');
    expect(screen.getByText('Principles of clear revision')).toBeTruthy();
  });

  it('has no detectable axe accessibility violations', async () => {
    render(<ArcShowcase />);
    const results = await axe.run(document.body);
    expect(results.violations).toEqual([]);
  }, 15000);
});
