import { type ButtonHTMLAttributes } from 'react';
import './IconButton.css';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; pressed?: boolean };

export function IconButton({
  label,
  children,
  pressed,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={`bard-icon-button ${className}`}
      aria-label={label}
      aria-pressed={pressed}
      {...props}
    >
      {children}
    </button>
  );
}
