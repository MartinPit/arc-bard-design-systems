import { useId, type TextareaHTMLAttributes } from 'react';
import { FieldMessage, join } from './shared';
import './shared.css';
import './Textarea.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, id: suppliedId, className, ...props }: TextareaProps) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const messageId = `${id}-message`;
  return (
    <div className={join('arc-field', className)}>
      <label className="arc-field__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className={join('arc-input', 'arc-textarea', error && 'arc-input--invalid')}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? messageId : undefined}
        {...props}
      />
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  );
}
