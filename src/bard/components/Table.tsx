import { type ReactNode } from 'react';
import './Table.css';

export type TableProps = { caption: string; headers: string[]; rows: ReactNode[][] };

export function Table({ caption, headers, rows }: TableProps) {
  return (
    <div className="bard-table-wrap" tabIndex={0} role="region" aria-label={`${caption}, scrollable table`}>
      <table className="bard-table">
        <caption>{caption}</caption>
        <thead><tr>{headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
