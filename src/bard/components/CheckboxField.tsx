import { Check } from 'lucide-react';
import './CheckboxField.css';

export type CheckboxFieldProps = { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean };

export function CheckboxField({ label, checked, onCheckedChange, disabled = false }: CheckboxFieldProps) {
  return (
    <label className={`bard-check${disabled ? ' bard-check--disabled' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onCheckedChange(event.target.checked)} disabled={disabled} />
      <span className="bard-check__box"><Check size={13} strokeWidth={2.5} aria-hidden="true" /></span>
      <span>{label}</span>
    </label>
  );
}
