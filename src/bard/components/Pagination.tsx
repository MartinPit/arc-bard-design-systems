import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from './IconButton';
import './Pagination.css';

export type PaginationProps = { page: number; pageCount: number; onPageChange: (page: number) => void };

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  return (
    <nav className="bard-pagination" aria-label="Pagination">
      <IconButton label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={18} /></IconButton>
      <div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
        <button type="button" key={number} className="bard-pagination__page" aria-label={`Page ${number}`} aria-current={number === page ? 'page' : undefined} onClick={() => onPageChange(number)}>{number}</button>
      ))}</div>
      <IconButton label="Next page" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}><ChevronRight size={18} /></IconButton>
    </nav>
  );
}
