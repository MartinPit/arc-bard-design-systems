import { useId, type CSSProperties } from 'react';
import './shared.css';
import './Slider.css';

export interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
}

export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, unit = '', disabled }: SliderProps) {
  const id = useId();
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="arc-slider">
      <div className="arc-slider__header">
        <label className="arc-field__label" htmlFor={id}>
          {label}
        </label>
        <output htmlFor={id} className="arc-slider__value">
          {value}
          {unit}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ '--arc-range-progress': `${percentage}%` } as CSSProperties}
      />
      <div className="arc-slider__limits" aria-hidden="true">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
