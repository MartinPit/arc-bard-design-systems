import { useEffect, useState, type ReactNode } from 'react';
import { Pagination } from './Pagination';
import './Table.css';

export interface TableProps {
  caption: string;
  columns: Array<{ key: string; label: string; numeric?: boolean }>;
  rows: Array<Record<string, ReactNode>>;
  emptyMessage?: string;
}

const tablePageSize = 50;

function readTablePage(parameter: string) {
  const requestedPage = Number(new URLSearchParams(window.location.search).get(parameter));
  return Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
}

export function Table({ caption, columns, rows, emptyMessage = 'No records to display.' }: TableProps) {
  const pageParameter = `${caption.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'table'}-page`;
  const [requestedPage, setRequestedPage] = useState(() => readTablePage(pageParameter));
  const pageCount = Math.ceil(rows.length / tablePageSize);
  const currentPage = Math.max(1, Math.min(requestedPage, pageCount));
  const visibleRows = rows.length > tablePageSize
    ? rows.slice((currentPage - 1) * tablePageSize, currentPage * tablePageSize)
    : rows;

  useEffect(() => {
    function restorePage() { setRequestedPage(readTablePage(pageParameter)); }
    restorePage();
    window.addEventListener('popstate', restorePage);
    return () => window.removeEventListener('popstate', restorePage);
  }, [pageParameter]);

  function getPageUrl(page: number) {
    const url = new URL(window.location.href);
    if (page > 1) url.searchParams.set(pageParameter, String(page));
    else url.searchParams.delete(pageParameter);
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function changePage(page: number) {
    window.history.pushState(window.history.state, '', getPageUrl(page));
    setRequestedPage(page);
  }

  return (
    <>
      <div className="arc-table-scroll" tabIndex={0} role="region" aria-label={`${caption}, scrollable table`}>
        <table className="arc-table">
          <caption>{caption}</caption>
          <thead>
            <tr>{columns.map((column) => <th scope="col" className={column.numeric ? 'arc-numeric' : undefined} key={column.key}>{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {visibleRows.length ? visibleRows.map((row, index) => (
              <tr key={index}>
                {columns.map((column, columnIndex) => columnIndex === 0 ? (
                  <th scope="row" key={column.key}>{row[column.key]}</th>
                ) : (
                  <td className={column.numeric ? 'arc-numeric' : undefined} key={column.key}>{row[column.key]}</td>
                ))}
              </tr>
            )) : (
              <tr><td className="arc-table__empty" colSpan={columns.length}>{emptyMessage}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {rows.length > tablePageSize && <Pagination currentPage={currentPage} totalPages={pageCount} onPageChange={changePage} getPageUrl={getPageUrl} />}
    </>
  );
}
