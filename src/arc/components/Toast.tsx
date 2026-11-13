import { useId, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';
import { IconButton } from './IconButton';
import { join } from './shared';
import './Toast.css';

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
