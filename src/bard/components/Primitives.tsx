import { useId, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Info, LoaderCircle, X } from 'lucide-react';

export function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'quiet';
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      className={`bard-button bard-button--${variant} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle className="bard-spin" size={16} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  label,
  children,
  pressed,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; pressed?: boolean }) {
  return (
    <button
      type="button"
      className={`bard-icon-button ${className}`}
      aria-label={label}
      aria-pressed={pressed}
      {...props}
    >
      {children}
    </button>
  );
}

export function TextInput({
  label,
  hint,
  error,
  id,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  return (
    <div className={`bard-field ${className}`}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        className={`bard-input${error ? ' bard-input--invalid' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? messageId : undefined}
        {...props}
      />
      {(hint || error) && (
        <p id={messageId} className={`bard-field__message${error ? ' bard-field__message--error' : ''}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

export function Textarea({
  label,
  hint,
  error,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string; error?: string }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  return (
    <div className="bard-field">
      <label htmlFor={inputId}>{label}</label>
      <textarea
        id={inputId}
        className={`bard-input bard-textarea${error ? ' bard-input--invalid' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? messageId : undefined}
        {...props}
      />
      {(hint || error) && (
        <p id={messageId} className={`bard-field__message${error ? ' bard-field__message--error' : ''}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  options,
  hint,
  id,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  hint?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
}) {
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

export function CheckboxField({ label, checked, onCheckedChange, disabled = false }: { label: string; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`bard-check${disabled ? ' bard-check--disabled' : ''}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onCheckedChange(event.target.checked)} disabled={disabled} />
      <span className="bard-check__box"><Check size={13} strokeWidth={2.5} aria-hidden="true" /></span>
      <span>{label}</span>
    </label>
  );
}

export function RadioGroupField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
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

export function SwitchField({ label, description, checked, onCheckedChange, disabled = false }: { label: string; description?: string; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean }) {
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

export function SliderField({ label, value, onValueChange, min = 0, max = 100, step = 1 }: { label: string; value: number; onValueChange: (value: number) => void; min?: number; max?: number; step?: number }) {
  const id = useId();
  return (
    <div className="bard-slider">
      <div className="bard-slider__label"><label htmlFor={id}>{label}</label><output htmlFor={id}>{value}%</output></div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(event) => onValueChange(Number(event.target.value))} style={{ '--bard-range-progress': `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties} />
      <div className="bard-slider__limits" aria-hidden="true"><span>{min}</span><span>{max}</span></div>
    </div>
  );
}

export function Tabs({ items }: { items: Array<{ value: string; label: string; content: ReactNode }> }) {
  const [value, setValue] = useState(items[0]?.value);
  return (
    <BaseTabs.Root className="bard-tabs" value={value} onValueChange={(next) => setValue(next)}>
      <BaseTabs.List className="bard-tabs__list" aria-label="Specimen views">
        {items.map((item) => <BaseTabs.Tab key={item.value} value={item.value} className="bard-tabs__tab">{item.label}</BaseTabs.Tab>)}
        <BaseTabs.Indicator className="bard-tabs__indicator" />
      </BaseTabs.List>
      {items.map((item) => <BaseTabs.Panel key={item.value} value={item.value} className="bard-tabs__panel">{item.content}</BaseTabs.Panel>)}
    </BaseTabs.Root>
  );
}

export function Dialog({ triggerLabel = 'Open dialog' }: { triggerLabel?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <BaseDialog.Root open={open} onOpenChange={setOpen}>
      <BaseDialog.Trigger render={<Button variant="secondary" />}>{triggerLabel}</BaseDialog.Trigger>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="bard-overlay" />
        <BaseDialog.Popup className="bard-dialog" aria-describedby="bard-dialog-description">
          <div className="bard-dialog__ornament" aria-hidden="true" />
          <BaseDialog.Close className="bard-icon-button bard-dialog__close" aria-label="Close dialog"><X size={18} /></BaseDialog.Close>
          <p className="bard-eyebrow">A considered interruption</p>
          <BaseDialog.Title className="bard-dialog__title">Keep the whole composition in view.</BaseDialog.Title>
          <BaseDialog.Description id="bard-dialog-description" className="bard-dialog__description">
            Dialogs are for a single, consequential decision. Return focus to the invoking control when the moment has passed.
          </BaseDialog.Description>
          <div className="bard-dialog__actions">
            <BaseDialog.Close render={<Button variant="quiet" />}>Not now</BaseDialog.Close>
            <BaseDialog.Close render={<Button />}>Accept &amp; close</BaseDialog.Close>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export function Popover() {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger className="bard-button bard-button--secondary"><Info size={16} aria-hidden="true" /><span>About this surface</span></BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner sideOffset={10}>
          <BasePopover.Popup className="bard-popover">
            <BasePopover.Title className="bard-popover__title">Quiet context</BasePopover.Title>
            <BasePopover.Description className="bard-popover__copy">Supplement the current task without navigating away. Popovers dismiss with Escape or an outside press.</BasePopover.Description>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

export function Tooltip() {
  return (
    <BaseTooltip.Provider delay={350}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger className="bard-icon-button" aria-label="More information"><Info size={18} /></BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner sideOffset={8}>
            <BaseTooltip.Popup className="bard-tooltip">Clarify, never conceal.</BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}

export type ToastMessage = { id: number; title: string; message: string };

export function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  return (
    <div className="bard-toast" role="status">
      <span className="bard-toast__mark"><Check size={16} aria-hidden="true" /></span>
      <div><strong>{toast.title}</strong><p>{toast.message}</p></div>
      <IconButton label="Dismiss notification" onClick={() => onDismiss(toast.id)}><X size={16} /></IconButton>
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'lilac' }) {
  return <span className={`bard-badge bard-badge--${tone}`}><span aria-hidden="true" />{children}</span>;
}

export function Avatar({ initials, label, status = false, tone = 'mint' }: { initials: string; label: string; status?: boolean; tone?: 'mint' | 'lilac' | 'aqua' }) {
  return <span className={`bard-avatar bard-avatar--${tone}`} role="img" aria-label={label}><span>{initials}</span>{status && <i title="Available" />}</span>;
}

export function Card({ eyebrow, title, children, footer, className = '' }: { eyebrow?: string; title: string; children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <article className={`bard-card ${className}`}>
      {eyebrow && <p className="bard-eyebrow">{eyebrow}</p>}
      <h4>{title}</h4>
      <div className="bard-card__body">{children}</div>
      {footer && <footer className="bard-card__footer">{footer}</footer>}
    </article>
  );
}

export function Table({ caption, headers, rows }: { caption: string; headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="bard-table-wrap" tabIndex={0} role="region" aria-label={`${caption}, scrollable table`}>
      <table className="bard-table">
        <caption>{caption}</caption>
        <thead><tr>{headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => cellIndex === 0 ? <th scope="row" key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, pageCount, onPageChange }: { page: number; pageCount: number; onPageChange: (page: number) => void }) {
  return (
    <nav className="bard-pagination" aria-label="Pagination">
      <IconButton label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={18} /></IconButton>
      <div>{Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
        <button type="button" key={number} className="bard-pagination__page" aria-label={`Page ${number}`} aria-current={number === page ? 'page' : undefined} onClick={() => onPageChange(number)}>{number}</button>
      ))}</div>
      <IconButton label="Next page" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}><ChevronRight size={18} /></IconButton>
    </nav>
  );
}
