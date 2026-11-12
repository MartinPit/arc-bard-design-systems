import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Info,
  LoaderCircle,
  X,
} from 'lucide-react';

function join(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={join('arc-button', `arc-button--${variant}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle className="arc-button__loader" size={16} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'outline' | 'quiet' | 'ink';
  children: ReactNode;
}

export function IconButton({
  label,
  variant = 'outline',
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={join('arc-icon-button', `arc-icon-button--${variant}`, className)}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

interface FieldMessageProps {
  id: string;
  error?: string;
  success?: string;
  hint?: string;
}

function FieldMessage({ id, error, success, hint }: FieldMessageProps) {
  if (error) {
    return (
      <span className="arc-field__message arc-field__message--error" id={id}>
        <CircleAlert size={14} aria-hidden="true" /> {error}
      </span>
    );
  }
  if (success) {
    return (
      <span className="arc-field__message arc-field__message--success" id={id}>
        <CheckCircle2 size={14} aria-hidden="true" /> {success}
      </span>
    );
  }
  return hint ? (
    <span className="arc-field__message" id={id}>
      {hint}
    </span>
  ) : null;
}

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  success?: string;
}

export function TextInput({
  label,
  hint,
  error,
  success,
  id: suppliedId,
  className,
  required,
  ...props
}: TextInputProps) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const messageId = `${id}-message`;
  return (
    <div className={join('arc-field', className)}>
      <label className="arc-field__label" htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <div className="arc-field__control">
        <input
          id={id}
          className={join('arc-input', error && 'arc-input--invalid', success && 'arc-input--success')}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error || success ? messageId : undefined}
          {...props}
        />
        {success && <CheckCircle2 className="arc-field__status" size={17} aria-hidden="true" />}
      </div>
      <FieldMessage id={messageId} hint={hint} error={error} success={success} />
    </div>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, id: suppliedId, className, ...props }: TextareaProps) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const messageId = `${id}-message`;
  return (
    <div className={join('arc-field', className)}>
      <label className="arc-field__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className={join('arc-input', 'arc-textarea', error && 'arc-input--invalid')}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? messageId : undefined}
        {...props}
      />
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, hint, error, id: suppliedId, children, className, ...props }: SelectProps) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  const messageId = `${id}-message`;
  return (
    <div className={join('arc-field', className)}>
      <label className="arc-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="arc-select-wrap">
        <select
          id={id}
          className={join('arc-input', 'arc-select', error && 'arc-input--invalid')}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? messageId : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={17} aria-hidden="true" />
      </div>
      <FieldMessage id={messageId} hint={hint} error={error} />
    </div>
  );
}

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

export interface TabsProps {
  label: string;
  items: Array<{ id: string; label: string; content: ReactNode; disabled?: boolean }>;
  defaultValue?: string;
}

export function Tabs({ label, items, defaultValue }: TabsProps) {
  const [active, setActive] = useState(defaultValue || items.find((item) => !item.disabled)?.id || items[0]?.id);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeItem = items.find((item) => item.id === active) || items[0];

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'Home') next = items.findIndex((item) => !item.disabled);
    else if (event.key === 'End') next = items.map((item) => !item.disabled).lastIndexOf(true);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      do { next = (next + direction + items.length) % items.length; } while (items[next]?.disabled && next !== index);
    } else return;
    event.preventDefault();
    if (!items[next]?.disabled) {
      setActive(items[next].id);
      refs.current[next]?.focus();
    }
  }

  return (
    <div className="arc-tabs">
      <div className="arc-tabs__list" role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => { refs.current[index] = node; }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={active === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={active === item.id ? 0 : -1}
            disabled={item.disabled}
            onClick={() => setActive(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {activeItem && (
        <div
          className="arc-tabs__panel"
          role="tabpanel"
          id={`panel-${activeItem.id}`}
          aria-labelledby={`tab-${activeItem.id}`}
          tabIndex={0}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children, footer }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = window.requestAnimationFrame(() => {
      const bodyControl = panelRef.current?.querySelector<HTMLElement>(`.arc-dialog__body ${focusableSelector}`);
      const first = bodyControl || panelRef.current?.querySelector<HTMLElement>(focusableSelector);
      (first || panelRef.current)?.focus();
    });
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChangeRef.current(false);
      }
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="arc-root arc-dialog-layer">
      <div
        className="arc-dialog-backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onOpenChange(false);
        }}
      >
        <div
          ref={panelRef}
          className="arc-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
        >
          <div className="arc-dialog__registration" aria-hidden="true">+</div>
          <div className="arc-dialog__header">
            <div>
              <p className="arc-eyebrow">Focused dialogue</p>
              <h2 id={titleId}>{title}</h2>
            </div>
            <IconButton label="Close dialog" variant="quiet" onClick={() => onOpenChange(false)}>
              <X size={20} aria-hidden="true" />
            </IconButton>
          </div>
          {description && <p id={descriptionId} className="arc-dialog__description">{description}</p>}
          <div className="arc-dialog__body">{children}</div>
          {footer && <div className="arc-dialog__footer">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export interface PopoverProps {
  trigger: ReactNode;
  label: string;
  children: ReactNode;
}

export function Popover({ trigger, label, children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();

  function toggle() {
    if (!open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: Math.max(12, Math.min(rect.left, window.innerWidth - 328)) });
    }
    setOpen((value) => !value);
  }

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    function onPointerDown(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node) && !anchorRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        anchorRef.current?.focus();
      }
    }
    function close() { setOpen(false); }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className="arc-button arc-button--secondary"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={toggle}
      >
        {trigger}
      </button>
      {open && createPortal(
        <div className="arc-root arc-popover-layer">
          <div
            ref={panelRef}
            id={id}
            className="arc-popover"
            role="dialog"
            aria-label={label}
            tabIndex={-1}
            style={{ top: position.top, left: position.left }}
          >
            <div className="arc-popover__rule" aria-hidden="true" />
            {children}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const wrapRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  function show() {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top: Math.max(8, rect.top - 40),
      left: Math.max(8, Math.min(rect.left + rect.width / 2 - 80, window.innerWidth - 176)),
    });
    setVisible(true);
  }

  return (
    <span
      ref={wrapRef}
      className="arc-tooltip-anchor"
      aria-describedby={visible ? id : undefined}
      onMouseEnter={show}
      onMouseLeave={() => setVisible(false)}
      onFocusCapture={show}
      onBlurCapture={() => setVisible(false)}
    >
      {children}
      {visible && createPortal(
        <span id={id} role="tooltip" className="arc-tooltip" style={{ top: position.top, left: position.left }}>
          {label}
        </span>,
        document.body,
      )}
    </span>
  );
}

export interface ToastProps {
  title: string;
  message: string;
  tone?: 'success' | 'info' | 'danger';
  onDismiss: () => void;
  index?: number;
}

export function Toast({ title, message, tone = 'info', onDismiss, index = 0 }: ToastProps) {
  const titleId = useId();
  const style = { '--arc-toast-index': index } as CSSProperties;
  return createPortal(
    <div className={join('arc-toast', `arc-toast--${tone}`)} role={tone === 'danger' ? 'alert' : 'status'} style={style}>
      <div className="arc-toast__icon" aria-hidden="true">
        {tone === 'success' ? <CheckCircle2 size={19} /> : tone === 'danger' ? <CircleAlert size={19} /> : <Info size={19} />}
      </div>
      <div>
        <strong id={titleId}>{title}</strong>
        <p>{message}</p>
      </div>
      <IconButton label={`Dismiss ${title}`} variant="quiet" onClick={onDismiss}>
        <X size={17} aria-hidden="true" />
      </IconButton>
    </div>,
    document.body,
  );
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'danger' | 'info';
  className?: string;
}) {
  return <span className={join('arc-badge', `arc-badge--${tone}`, className)}>{children}</span>;
}

export function Avatar({ name, size = 'medium', marked = false }: { name: string; size?: 'small' | 'medium' | 'large'; marked?: boolean }) {
  const initials = name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className={join('arc-avatar', `arc-avatar--${size}`)} role="img" aria-label={marked ? `${name}, available` : name}>
      <span aria-hidden="true">{initials}</span>
      {marked && <span className="arc-avatar__mark" aria-hidden="true" />}
    </span>
  );
}

export function Card({
  eyebrow,
  title,
  children,
  footer,
  accent = false,
  className,
  ...props
}: {
  eyebrow?: string;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  accent?: boolean;
  className?: string;
} & HTMLAttributes<HTMLElement>) {
  const id = useId();
  return (
    <article className={join('arc-card', accent && 'arc-card--accent', className)} aria-labelledby={id} {...props}>
      <div className="arc-card__header">
        {eyebrow && <p className="arc-eyebrow">{eyebrow}</p>}
        <h3 id={id}>{title}</h3>
      </div>
      <div className="arc-card__content">{children}</div>
      {footer && <div className="arc-card__footer">{footer}</div>}
    </article>
  );
}

export interface TableProps {
  caption: string;
  columns: Array<{ key: string; label: string; numeric?: boolean }>;
  rows: Array<Record<string, ReactNode>>;
  emptyMessage?: string;
}

export function Table({ caption, columns, rows, emptyMessage = 'No records to display.' }: TableProps) {
  return (
    <div className="arc-table-scroll" tabIndex={0} role="region" aria-label={`${caption}, scrollable table`}>
      <table className="arc-table">
        <caption>{caption}</caption>
        <thead>
          <tr>{columns.map((column) => <th scope="col" className={column.numeric ? 'arc-numeric' : undefined} key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column, columnIndex) => columnIndex === 0 ? (
                <th scope="row" key={column.key}>{row[column.key]}</th>
              ) : (
                <td className={column.numeric ? 'arc-numeric' : undefined} key={column.key}>{row[column.key]}</td>
              ))}
            </tr>
          )) : (
            <tr><td className="arc-table__empty" colSpan={columns.length}>{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1,
  );
  return (
    <nav className="arc-pagination" aria-label="Pagination">
      <IconButton label="Previous page" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <ArrowLeft size={17} aria-hidden="true" />
      </IconButton>
      <div className="arc-pagination__pages">
        {pages.map((page, index) => (
          <span key={page} className="arc-pagination__item">
            {index > 0 && page - pages[index - 1] > 1 && <span className="arc-pagination__ellipsis" aria-hidden="true">…</span>}
            <button
              type="button"
              className={join('arc-pagination__button', currentPage === page && 'arc-pagination__button--current')}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </span>
        ))}
      </div>
      <IconButton label="Next page" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <ArrowRight size={17} aria-hidden="true" />
      </IconButton>
    </nav>
  );
}
