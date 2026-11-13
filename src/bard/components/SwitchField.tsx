import { useId } from 'react';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import './SwitchField.css';

export type SwitchFieldProps = { label: string; description?: string; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean };

export function SwitchField({ label, description, checked, onCheckedChange, disabled = false }: SwitchFieldProps) {
  return (
    <div className={`bard-switch-field${disabled ? ' bard-switch-field--disabled' : ''}`}>
      <span className="bard-switch-field__copy" id={useId()}>
        <span>{label}</span>{description && <small>{description}</small>}
      </span>
      <BaseSwitch.Root
        className="bard-switch"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-label={label}
      >
        <BaseSwitch.Thumb className="bard-switch__thumb" />
      </BaseSwitch.Root>
    </div>
  );
}
