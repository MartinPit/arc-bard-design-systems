import { useId, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { join } from './shared';
import './shared.css';
import './Checkbox.css';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export function Checkbox({ label, description, id: suppliedId, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  return (
    <label className={join('arc-choice', className)} htmlFor={id}>
      <input id={id} type="checkbox" className="arc-checkbox" aria-describedby={description ? `${id}-description` : undefined} {...props} />
      <span className="arc-choice__mark" aria-hidden="true">
        <Check size={14} />
      </span>
      <span>
        <span className="arc-choice__label">{label}</span>
        {description && (
          <span className="arc-choice__description" id={`${id}-description`}>
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
