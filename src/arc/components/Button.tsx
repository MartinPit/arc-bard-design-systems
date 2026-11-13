import { type ButtonHTMLAttributes } from 'react';
import { LoaderCircle } from 'lucide-react';
import { join } from './shared';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={join('arc-button', `arc-button--${variant}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle className="arc-button__loader" size={16} aria-hidden="true" />}
      <span className="arc-button__content">{children}</span>
    </button>
  );
}
