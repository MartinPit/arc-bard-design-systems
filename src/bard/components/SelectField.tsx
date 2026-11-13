import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import './SelectField.css';

export type SelectFieldProps = {
  label: string;
  options: Array<{ value: string; label: string }>;
  hint?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
};

export function SelectField({
  label,
  options,
  hint,
  id,
  value,
  onChange,
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <div className="bard-field">
      <label htmlFor={selectId}>{label}</label>
      <div className="bard-select">
        <select id={selectId} className="bard-input" value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={hint ? `${selectId}-hint` : undefined}>
          {options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown size={16} aria-hidden="true" />
      </div>
      {hint && <p id={`${selectId}-hint`} className="bard-field__message">{hint}</p>}
    </div>
  );
}
