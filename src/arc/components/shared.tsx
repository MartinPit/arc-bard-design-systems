import { CheckCircle2, CircleAlert } from 'lucide-react';

export function join(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

interface FieldMessageProps {
  id: string;
  error?: string;
  success?: string;
  hint?: string;
}

export function FieldMessage({ id, error, success, hint }: FieldMessageProps) {
  return (
    <span
      className={join('arc-field__message', error && 'arc-field__message--error', !error && success && 'arc-field__message--success')}
      id={id}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {error && <CircleAlert size={14} aria-hidden="true" />}
      {!error && success && <CheckCircle2 size={14} aria-hidden="true" />}
      {error || success || hint}
    </span>
  );
}
