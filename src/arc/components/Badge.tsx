import { type ReactNode } from 'react';
import { join } from './shared';
import './Badge.css';

export interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'danger' | 'info';
  className?: string;
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: BadgeProps) {
  return <span className={join('arc-badge', `arc-badge--${tone}`, className)}>{children}</span>;
}
