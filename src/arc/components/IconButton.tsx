import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { join } from './shared';
import './IconButton.css';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'outline' | 'quiet' | 'ink';
  children: ReactNode;
}

export function IconButton({
  label,
  variant = 'outline',
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={join('arc-icon-button', `arc-icon-button--${variant}`, className)}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}
