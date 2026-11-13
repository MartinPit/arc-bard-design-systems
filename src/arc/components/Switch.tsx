import { useId } from 'react';
import { join } from './shared';
import './shared.css';
import './Switch.css';

export interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ label, description, checked, onCheckedChange, disabled }: SwitchProps) {
  const id = useId();
  return (
    <label className={join('arc-switch', disabled && 'arc-switch--disabled')} htmlFor={id}>
      <span>
        <span className="arc-choice__label">{label}</span>
        {description && <span className="arc-choice__description">{description}</span>}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span className="arc-switch__track" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}
