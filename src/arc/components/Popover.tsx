import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
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
  const [position, setPosition] = useState({ top: 12, left: 12, maxHeight: 0, width: 0 });
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useLayoutEffect(() => {
    if (!open) return;
    function updatePosition() {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;
      const anchorRect = anchor.getBoundingClientRect();
      const gutter = 12;
      const gap = 8;
      const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
      const viewportHeight = window.innerHeight;
      const panelWidth = Math.min(panel.offsetWidth, Math.max(0, viewportWidth - gutter * 2));
      const contentHeight = Math.min(panel.scrollHeight, Math.max(0, viewportHeight - gutter * 2));
      const spaceBelow = Math.max(0, viewportHeight - gutter - anchorRect.bottom - gap);
      const spaceAbove = Math.max(0, anchorRect.top - gap - gutter);
      const placeAbove = spaceBelow < contentHeight && spaceAbove > spaceBelow;
      const availableHeight = placeAbove ? spaceAbove : spaceBelow;
      const maxHeight = Math.min(contentHeight, availableHeight);
      const preferredTop = placeAbove ? anchorRect.top - gap - maxHeight : anchorRect.bottom + gap;
      const top = Math.max(gutter, Math.min(preferredTop, viewportHeight - gutter - maxHeight));
      const left = Math.max(gutter, Math.min(anchorRect.left, viewportWidth - gutter - panelWidth));
      setPosition((current) => current.top === top && current.left === left && current.maxHeight === maxHeight && current.width === panelWidth
        ? current
        : { top, left, maxHeight, width: panelWidth });
    }
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [open]);

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
    function closeOnOutsideScroll(event: Event) {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', closeOnOutsideScroll, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', closeOnOutsideScroll, true);
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
        onClick={() => setOpen((value) => !value)}
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
            style={{ top: position.top, left: position.left, maxHeight: position.maxHeight || undefined, width: position.width || undefined }}
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
