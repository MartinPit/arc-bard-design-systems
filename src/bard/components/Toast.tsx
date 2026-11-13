import { Check, X } from 'lucide-react';
import { IconButton } from './IconButton';
import './Toast.css';

export type ToastMessage = { id: number; title: string; message: string };
export type ToastProps = { toast: ToastMessage; onDismiss: (id: number) => void };

export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div className="bard-toast" role="status">
      <span className="bard-toast__mark"><Check size={16} aria-hidden="true" /></span>
      <div><strong>{toast.title}</strong><p>{toast.message}</p></div>
      <IconButton label="Dismiss notification" onClick={() => onDismiss(toast.id)}><X size={16} /></IconButton>
    </div>
  );
}
