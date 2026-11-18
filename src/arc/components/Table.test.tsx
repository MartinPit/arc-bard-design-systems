import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Table, type TableProps } from './Table';

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

const columns: TableProps['columns'] = [
  { key: 'resource', label: 'Resource' },
  { key: 'entries', label: 'Entries', numeric: true },
];

function makeRows(count: number): TableProps['rows'] {
  return Array.from({ length: count }, (_, index) => ({
    resource: `Reading register ${index + 1}`,
    entries: index * 7 + 3,
  }));
}

describe('Arc Table', () => {
  it('paginates more than 50 public rows without losing semantics or reading order', () => {
    const rows = makeRows(51);
    rows[50].entries = <button type="button">Open reading register 51</button>;
    render(<Table caption="Reading register" columns={columns} rows={rows} />);

    expect(screen.getByRole('table', { name: 'Reading register' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Reading register, scrollable table' })).toHaveAttribute('tabindex', '0');
    expect(screen.getAllByRole('row')).toHaveLength(51);
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['Resource', 'Entries']);
    expect(screen.getAllByRole('rowheader')).toHaveLength(50);
    expect(screen.getByRole('rowheader', { name: 'Reading register 1' })).toHaveAttribute('scope', 'row');
    expect(screen.queryByRole('rowheader', { name: 'Reading register 51' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Page 2' }));
    expect(screen.getAllByRole('row')).toHaveLength(2);
    const lastHeader = screen.getByRole('rowheader', { name: 'Reading register 51' });
    expect(lastHeader).toHaveAttribute('scope', 'row');
    const lateControl = within(lastHeader.closest('tr')!).getByRole('button', { name: 'Open reading register 51' });
    lateControl.focus();
    expect(lateControl).toHaveFocus();
  });

  it('restores large-table pages from the URL and history', () => {
    window.history.replaceState({}, '', '/?reading-register-page=2#reading-register');
    render(<Table caption="Reading register" columns={columns} rows={makeRows(51)} />);

    expect(screen.getByRole('rowheader', { name: 'Reading register 51' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Page 1' })).toHaveAttribute('href', '/#reading-register');

    fireEvent.click(screen.getByRole('link', { name: 'Page 1' }));
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('#reading-register');
    expect(screen.getByRole('rowheader', { name: 'Reading register 1' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Page 2' }));
    expect(window.location.search).toBe('?reading-register-page=2');
    window.history.replaceState({}, '', '/#reading-register');
    fireEvent.popState(window);
    expect(screen.getByRole('rowheader', { name: 'Reading register 1' })).toBeInTheDocument();
  });

  it('keeps the same semantics at the 50-row boundary', () => {
    render(<Table caption="Reading register" columns={columns} rows={makeRows(50)} />);

    expect(screen.getAllByRole('row')).toHaveLength(51);
    expect(screen.getAllByRole('rowheader')).toHaveLength(50);
    expect(screen.getByRole('cell', { name: '346' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
  });

  it('preserves the named empty state and custom message', () => {
    render(<Table caption="Reading register" columns={columns} rows={[]} emptyMessage="No reading records match." />);

    expect(screen.queryByRole('rowheader')).not.toBeInTheDocument();
    const emptyCell = screen.getByRole('cell', { name: 'No reading records match.' });
    expect(emptyCell).toHaveAttribute('colspan', '2');
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
  });
});
