import { type ReactNode } from 'react';
import './Table.css';

export interface TableProps {
  caption: string;
  columns: Array<{ key: string; label: string; numeric?: boolean }>;
  rows: Array<Record<string, ReactNode>>;
  emptyMessage?: string;
}

export function Table({ caption, columns, rows, emptyMessage = 'No records to display.' }: TableProps) {
  return (
    <div className="arc-table-scroll" tabIndex={0} role="region" aria-label={`${caption}, scrollable table`}>
      <table className="arc-table">
        <caption>{caption}</caption>
        <thead>
          <tr>{columns.map((column) => <th scope="col" className={column.numeric ? 'arc-numeric' : undefined} key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
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
  );
}
