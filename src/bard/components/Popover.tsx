import { Popover as BasePopover } from '@base-ui/react/popover';
import { Info } from 'lucide-react';
import './Button.css';
import './Popover.css';

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
