import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './ToastRegion.css';

export function ToastRegion({ children }: { children: ReactNode }) {
  return createPortal(
    <div className="arc-root arc-toast-region" role="region" aria-label="Notifications">
      {children}
    </div>,
    document.body,
  );
}
