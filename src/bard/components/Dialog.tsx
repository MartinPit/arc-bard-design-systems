import { useState } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { Button } from './Button';
import './IconButton.css';
import './Dialog.css';

export type DialogProps = { triggerLabel?: string };

export function Dialog({ triggerLabel = 'Open dialog' }: DialogProps) {
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
