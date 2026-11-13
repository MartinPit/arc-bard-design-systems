import { useId } from 'react';
import './RadioGroupField.css';

export type RadioGroupFieldProps = {
  label: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value: string;
  onChange: (value: string) => void;
};

export function RadioGroupField({
  label,
  options,
  value,
  onChange,
}: RadioGroupFieldProps) {
  const name = useId();
  return (
    <fieldset className="bard-radio-group">
      <legend>{label}</legend>
      {options.map((option) => (
        <label className="bard-radio" key={option.value}>
          <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
          <span className="bard-radio__mark" />
          <span><span>{option.label}</span>{option.description && <small>{option.description}</small>}</span>
        </label>
      ))}
    </fieldset>
  );
}
