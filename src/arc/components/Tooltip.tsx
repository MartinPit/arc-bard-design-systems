import { useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

export interface TooltipProps {
  label: string;
  children: ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
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
