import { useId, type InputHTMLAttributes } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { FieldMessage, join } from './shared';
import './shared.css';
import './TextInput.css';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  success?: string;
}

export function TextInput({
  label,
  hint,
  error,
  success,
  id: suppliedId,
  className,
  required,
  ...props
}: TextInputProps) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const messageId = `${id}-message`;
  return (
    <div className={join('arc-field', className)}>
      <label className="arc-field__label" htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <div className="arc-field__control">
        <input
          id={id}
          className={join('arc-input', error && 'arc-input--invalid', success && 'arc-input--success')}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error || success ? messageId : undefined}
          {...props}
        />
        {success && <CheckCircle2 className="arc-field__status" size={17} aria-hidden="true" />}
      </div>
      <FieldMessage id={messageId} hint={hint} error={error} success={success} />
    </div>
  );
}
