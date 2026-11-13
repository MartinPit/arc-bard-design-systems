import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';
import './Dialog.css';

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
