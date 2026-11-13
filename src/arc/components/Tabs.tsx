import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import './Tabs.css';

export interface TabsProps {
  label: string;
  items: Array<{ id: string; label: string; content: ReactNode; disabled?: boolean }>;
  defaultValue?: string;
}

export function Tabs({ label, items, defaultValue }: TabsProps) {
  const [active, setActive] = useState(defaultValue || items.find((item) => !item.disabled)?.id || items[0]?.id);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeItem = items.find((item) => item.id === active) || items[0];

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === 'Home') next = items.findIndex((item) => !item.disabled);
    else if (event.key === 'End') next = items.map((item) => !item.disabled).lastIndexOf(true);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      do { next = (next + direction + items.length) % items.length; } while (items[next]?.disabled && next !== index);
    } else return;
    event.preventDefault();
    if (!items[next]?.disabled) {
      setActive(items[next].id);
      refs.current[next]?.focus();
    }
  }

  return (
    <div className="arc-tabs">
      <div className="arc-tabs__list" role="tablist" aria-label={label}>
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => { refs.current[index] = node; }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={active === item.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={active === item.id ? 0 : -1}
            disabled={item.disabled}
            onClick={() => setActive(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {activeItem && (
        <div
          className="arc-tabs__panel"
          role="tabpanel"
          id={`panel-${activeItem.id}`}
          aria-labelledby={`tab-${activeItem.id}`}
          tabIndex={0}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
