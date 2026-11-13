import { type ReactNode } from 'react';
import './Badge.css';

export type BadgeProps = { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'lilac' };

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={`bard-badge bard-badge--${tone}`}><span aria-hidden="true" />{children}</span>;
}
