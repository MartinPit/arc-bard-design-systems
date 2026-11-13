import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { Info } from 'lucide-react';
import './IconButton.css';
import './Tooltip.css';

export function Tooltip() {
  return (
    <BaseTooltip.Provider delay={350}>
      <BaseTooltip.Root>
        <BaseTooltip.Trigger className="bard-icon-button" aria-label="More information"><Info size={18} /></BaseTooltip.Trigger>
        <BaseTooltip.Portal>
          <BaseTooltip.Positioner sideOffset={8}>
            <BaseTooltip.Popup className="bard-tooltip">Clarify, never conceal.</BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </BaseTooltip.Portal>
      </BaseTooltip.Root>
    </BaseTooltip.Provider>
  );
}
