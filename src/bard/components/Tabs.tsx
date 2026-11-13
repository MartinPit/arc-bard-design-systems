import { useState, type ReactNode } from 'react';
import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import './Tabs.css';

export type TabsProps = { items: Array<{ value: string; label: string; content: ReactNode }> };

export function Tabs({ items }: TabsProps) {
  const [value, setValue] = useState(items[0]?.value);
  return (
    <BaseTabs.Root className="bard-tabs" value={value} onValueChange={(next) => setValue(next)}>
      <BaseTabs.List className="bard-tabs__list" aria-label="Specimen views">
        {items.map((item) => <BaseTabs.Tab key={item.value} value={item.value} className="bard-tabs__tab">{item.label}</BaseTabs.Tab>)}
        <BaseTabs.Indicator className="bard-tabs__indicator" />
      </BaseTabs.List>
      {items.map((item) => <BaseTabs.Panel key={item.value} value={item.value} className="bard-tabs__panel">{item.content}</BaseTabs.Panel>)}
    </BaseTabs.Root>
  );
}
