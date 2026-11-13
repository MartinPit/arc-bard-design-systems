import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { FieldMessage, join } from './shared';
import './shared.css';
import './Select.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, hint, error, id: suppliedId, children, className, ...props }: SelectProps) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const messageId = `${id}-message`;
  return (
    <div className={join('arc-field', className)}>
      <label className="arc-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="arc-select-wrap">
        <select
          id={id}
          className={join('arc-input', 'arc-select', error && 'arc-input--invalid')}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? messageId : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={17} aria-hidden="true" />
      </div>
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  );
}
