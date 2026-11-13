import { type ReactNode } from 'react';
import './Card.css';

export type CardProps = { eyebrow?: string; title: string; children: ReactNode; footer?: ReactNode; className?: string };

export function Card({ eyebrow, title, children, footer, className = '' }: CardProps) {
  return (
    <article className={`bard-card ${className}`}>
      {eyebrow && <p className="bard-eyebrow">{eyebrow}</p>}
      <h4>{title}</h4>
      <div className="bard-card__body">{children}</div>
      {footer && <footer className="bard-card__footer">{footer}</footer>}
    </article>
  );
}
