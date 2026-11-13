import { useId } from 'react';
import { CircleAlert } from 'lucide-react';
import './shared.css';
import './Checkbox.css';
import './RadioGroup.css';

export interface RadioGroupProps {
  label: string;
  name: string;
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function RadioGroup({ label, name, options, value, onChange, error }: RadioGroupProps) {
  const id = useId();
  return (
    <fieldset className="arc-radio-group" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="arc-field__label">{label}</legend>
      {options.map((option) => (
        <label className="arc-choice" key={option.value}>
          <input
            className="arc-radio"
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => onChange(option.value)}
          />
          <span className="arc-choice__mark" aria-hidden="true" />
          <span>
            <span className="arc-choice__label">{option.label}</span>
            {option.description && <span className="arc-choice__description">{option.description}</span>}
          </span>
        </label>
      ))}
      {error && (
        <span className="arc-field__message arc-field__message--error" id={`${id}-error`}>
          <CircleAlert size={14} aria-hidden="true" /> {error}
        </span>
      )}
    </fieldset>
  );
}
