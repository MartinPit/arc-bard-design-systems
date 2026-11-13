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
  if (error) {
    return (
      <span className="arc-field__message arc-field__message--error" id={id}>
        <CircleAlert size={14} aria-hidden="true" /> {error}
      </span>
    );
  }
  if (success) {
    return (
      <span className="arc-field__message arc-field__message--success" id={id}>
        <CheckCircle2 size={14} aria-hidden="true" /> {success}
      </span>
    );
  }
  return hint ? (
    <span className="arc-field__message" id={id}>
      {hint}
    </span>
  ) : null;
}
