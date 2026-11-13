import { useId, type HTMLAttributes, type ReactNode } from 'react';
import { join } from './shared';
import './Card.css';

export type CardProps = {
  eyebrow?: string;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  accent?: boolean;
  className?: string;
} & HTMLAttributes<HTMLElement>;

export function Card({
  eyebrow,
  title,
  children,
  footer,
  accent = false,
  className,
  ...props
}: CardProps) {
  const id = useId();
  return (
    <article className={join('arc-card', accent && 'arc-card--accent', className)} aria-labelledby={id} {...props}>
      <div className="arc-card__header">
        {eyebrow && <p className="arc-eyebrow">{eyebrow}</p>}
        <h3 id={id}>{title}</h3>
      </div>
      <div className="arc-card__content">{children}</div>
      {footer && <div className="arc-card__footer">{footer}</div>}
    </article>
  );
}
