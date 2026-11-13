import { useId, type InputHTMLAttributes } from 'react';
import './TextInput.css';

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string };

export function TextInput({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}: TextInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  return (
    <div className={`bard-field ${className}`}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className={`bard-input${error ? ' bard-input--invalid' : ''}`}
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
