import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
  ariaLabel: string;
}

export function Tabs({ items, value, onChange, className, size = 'md', ariaLabel }: TabsProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn('flex items-center gap-0.5', className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded border font-medium transition-colors duration-150 ease-out',
              size === 'sm' ? 'h-6 px-2 text-2xs' : 'h-7 px-2.5 text-xs',
              active ?
              'border-line bg-surface2 text-fg' :
              'border-transparent text-muted hover:text-fg hover:bg-surface2'
            )}>
            
            {item.icon}
            {item.label}
            {typeof item.count === 'number' ?
            <span className={cn('font-mono text-2xs', active ? 'text-accent' : 'text-faint')}>{item.count}</span> :
            null}
          </button>);

      })}
    </div>);

}