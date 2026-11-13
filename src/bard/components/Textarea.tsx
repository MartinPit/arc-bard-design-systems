import { useId, type TextareaHTMLAttributes } from 'react';
import './Textarea.css';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string };

export function Textarea({
  label,
  hint,
  error,
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  return (
    <div className="bard-field">
      <label htmlFor={inputId}>{label}</label>
      <textarea
        id={inputId}
        className={`bard-input bard-textarea${error ? ' bard-input--invalid' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? messageId : undefined}
        {...props}
      />
      {(hint || error) && (
        <p id={messageId} className={`bard-field__message${error ? ' bard-field__message--error' : ''}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
