import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';
import { formatNumber } from '../intl';
import { IconButton } from './IconButton';
import { join } from './shared';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getPageUrl: (page: number) => string;
}

export function Pagination({ currentPage, totalPages, onPageChange, getPageUrl }: PaginationProps) {
  const pageCount = Math.max(0, Math.floor(totalPages) || 0);
  const activePage = pageCount ? Math.min(pageCount, Math.max(1, Math.floor(currentPage) || 1)) : 0;
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === pageCount || Math.abs(page - activePage) <= 1,
  );

  function followLink(event: MouseEvent<HTMLAnchorElement>, page: number) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onPageChange(page);
  }

  function boundary(label: string, page: number, disabled: boolean, icon: ReactNode) {
    if (disabled) return <IconButton label={label} disabled>{icon}</IconButton>;
    return (
      <a
        className="arc-icon-button arc-icon-button--outline"
        href={getPageUrl(page)}
        aria-label={label}
        title={label}
        onClick={(event) => followLink(event, page)}
      >
        {icon}
      </a>
    );
  }

  return (
    <nav className="arc-pagination" aria-label="Pagination">
      {boundary('Previous Page', activePage - 1, activePage <= 1, <ArrowLeft size={17} aria-hidden="true" />)}
      <div className="arc-pagination__pages">
        {pages.map((page, index) => (
          <span key={page} className="arc-pagination__item">
            {index > 0 && page - pages[index - 1] > 1 && <span className="arc-pagination__ellipsis" aria-hidden="true">…</span>}
            <a
              className={join('arc-pagination__button', activePage === page && 'arc-pagination__button--current')}
              href={getPageUrl(page)}
              aria-label={`Page ${formatNumber(page)}`}
              aria-current={activePage === page ? 'page' : undefined}
              onClick={(event) => followLink(event, page)}
            >
              {formatNumber(page)}
            </a>
          </span>
        ))}
      </div>
      {boundary('Next Page', activePage + 1, activePage >= pageCount, <ArrowRight size={17} aria-hidden="true" />)}
    </nav>
  );
}
