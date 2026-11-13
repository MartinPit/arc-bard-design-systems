import { type ButtonHTMLAttributes } from 'react';
import { LoaderCircle } from 'lucide-react';
import './Button.css';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet';
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`bard-button bard-button--${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle className="bard-spin" size={16} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
