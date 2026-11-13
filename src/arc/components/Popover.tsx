import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Button.css';
import './Popover.css';

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
