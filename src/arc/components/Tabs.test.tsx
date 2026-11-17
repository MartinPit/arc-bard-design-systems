import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

const items = [
  { id: 'overview', label: 'Overview', content: <p>Overview content</p> },
  { id: 'notes', label: 'Notes', content: <p>Notes content</p> },
];

describe('Tabs', () => {
  it('keeps tab and panel relationships unique across instances with reused item IDs', () => {
    const { container } = render(<>
      <Tabs label="First resource" items={items} />
      <Tabs label="Second resource" items={items} />
    </>);

    const ids = Array.from(container.querySelectorAll('[id]'), (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const label of ['First resource', 'Second resource']) {
      const tablist = screen.getByRole('tablist', { name: label });
      const tab = within(tablist).getByRole('tab', { name: 'Overview' });
      const panelId = tab.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      const panel = document.getElementById(panelId!);
      expect(panel).toHaveAttribute('aria-labelledby', tab.id);
      expect(panel).toHaveTextContent('Overview content');

      fireEvent.click(within(tablist).getByRole('tab', { name: 'Notes' }));
      expect(within(tablist).getByRole('tab', { name: 'Notes' })).toHaveAttribute('aria-selected', 'true');
      expect(document.getElementById(panelId!)).not.toBeInTheDocument();
    }
  });
});
