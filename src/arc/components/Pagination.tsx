import { ArrowLeft, ArrowRight } from 'lucide-react';
import { IconButton } from './IconButton';
import { join } from './shared';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );
  return (
    <nav className="arc-pagination" aria-label="Pagination">
      <IconButton label="Previous page" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <ArrowLeft size={17} aria-hidden="true" />
      </IconButton>
      <div className="arc-pagination__pages">
        {pages.map((page, index) => (
          <span key={page} className="arc-pagination__item">
            {index > 0 && page - pages[index - 1] > 1 && <span className="arc-pagination__ellipsis" aria-hidden="true">…</span>}
            <button
              type="button"
              className={join('arc-pagination__button', currentPage === page && 'arc-pagination__button--current')}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </span>
        ))}
      </div>
      <IconButton label="Next page" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <ArrowRight size={17} aria-hidden="true" />
      </IconButton>
    </nav>
  );
}
