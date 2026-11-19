import type { MouseEvent, ReactNode } from 'react';
import { getFlashcardUrl, type FlashcardRoute } from './urlState';
import type { FlashcardSet } from './types';

export function followInternalLink(event: MouseEvent<HTMLAnchorElement>, action: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  action();
}

interface RouteLinkProps {
  route: FlashcardRoute;
  onNavigate: (route: FlashcardRoute) => void;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
  'aria-current'?: 'page';
}

export function RouteLink({ route, onNavigate, className, children, ...props }: RouteLinkProps) {
  return <a {...props} className={className} href={getFlashcardUrl(route)} onClick={(event) => followInternalLink(event, () => onNavigate(route))}>{children}</a>;
}

export function ArcLeafMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`fc-leaf ${className}`} viewBox="0 0 40 44" aria-hidden="true">
      <path d="M20 39C6 31 5 15 17 4c9 10 11 23 3 35Z" fill="var(--arc-marigold)" stroke="currentColor" />
      <path d="M21 39C34 34 38 23 33 12c-9 5-15 15-12 27Z" fill="var(--arc-magenta)" stroke="currentColor" />
      <path d="M13 13c7 11 7 20 8 29M31 19l-9 20" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function ContentStack({ values, className = '' }: { values: string[]; className?: string }) {
  return <div className={`fc-content-stack ${className}`}>{values.map((value, index) => <p key={`${index}-${value}`}>{value}</p>)}</div>;
}

interface SetCardPreviewProps {
  set: FlashcardSet;
  frontFields: string[];
  backFields: string[];
  compact?: boolean;
}

export function SetCardPreview({ set, frontFields, backFields, compact = false }: SetCardPreviewProps) {
  const fieldIds = new Map(set.fields.map((field) => [field.name, field.id]));
  const selectedFieldIds = [...frontFields, ...backFields].map((name) => fieldIds.get(name) ?? '');
  const card = set.cards.find((item) => selectedFieldIds.length > 0 && selectedFieldIds.every((id) => item.values[id]?.trim()));
  const front = card ? frontFields.map((name) => card.values[fieldIds.get(name) ?? '']?.trim() ?? '') : [];
  const back = card ? backFields.map((name) => card.values[fieldIds.get(name) ?? '']?.trim() ?? '') : [];
  const position = card ? set.cards.indexOf(card) + 1 : 0;
  return (
    <article className={`fc-paper-card${compact ? ' fc-paper-card--compact' : ''}`} aria-label={card ? `Preview of ${set.name}, card ${position}` : `${set.name}, empty set`}>
      <div className="fc-paper-card__registration"><span>CARD {String(position).padStart(2, '0')} · PREVIEW</span><span aria-hidden="true">✦</span></div>
      {card ? <><ContentStack values={front} className="fc-paper-card__front" /><ContentStack values={back} className="fc-paper-card__back" /></> : <p className="fc-paper-card__empty">No card contains every selected field yet.</p>}
      <footer><span>{set.name}</span><span>{position} / {set.cards.length}</span></footer>
    </article>
  );
}
