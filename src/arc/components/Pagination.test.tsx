import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './Pagination';

const getPageUrl = (page: number) => `/resources/?page=${page}`;

describe('Pagination', () => {
  it('renders bounded links without invalid destinations for empty and out-of-range collections', () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<Pagination currentPage={0} totalPages={0} onPageChange={onPageChange} getPageUrl={getPageUrl} />);

    expect(screen.queryByRole('link', { name: /^Page \d+$/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

    rerender(<Pagination currentPage={-3} totalPages={3} onPageChange={onPageChange} getPageUrl={getPageUrl} />);
    expect(screen.getByRole('link', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    fireEvent.click(screen.getByRole('link', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);

    rerender(<Pagination currentPage={99} totalPages={3} onPageChange={onPageChange} getPageUrl={getPageUrl} />);
    expect(screen.getByRole('link', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    fireEvent.click(screen.getByRole('link', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    expect(onPageChange).toHaveBeenCalledTimes(2);
  });
});
