import { useId } from 'react';
import './SliderField.css';

export type SliderFieldProps = { label: string; value: number; onValueChange: (value: number) => void; min?: number; max?: number; step?: number };

export function SliderField({ label, value, onValueChange, min = 0, max = 100, step = 1 }: SliderFieldProps) {
  const id = useId();
  return (
    <div className="bard-slider">
      <div className="bard-slider__label"><label htmlFor={id}>{label}</label><output htmlFor={id}>{value}%</output></div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onValueChange(Number(event.target.value))} style={{ '--bard-range-progress': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties} />
      <div className="bard-slider__limits" aria-hidden="true"><span>{min}</span><span>{max}</span></div>
    </div>
  );
}
