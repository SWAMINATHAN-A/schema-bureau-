import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

interface DropdownProps {
  trigger: (props: {open: boolean;toggle: () => void;}) => React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: string;
  label: string;
}

export function Dropdown({ trigger, items, align = 'right', width = 'w-56', label }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as globalThis.Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open ?
      <div
        role="menu"
        aria-label={label}
        className={cn(
          'absolute z-40 mt-1.5 overflow-hidden rounded-md border border-line bg-elevated py-1 shadow-2xl',
          width,
          align === 'right' ? 'right-0' : 'left-0'
        )}>
        
          {items.map((item) =>
        <button
          key={item.id}
          role="menuitem"
          type="button"
          disabled={item.disabled}
          onClick={() => {
            item.onSelect();
            setOpen(false);
          }}
          className={cn(
            'flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-[13px] transition-colors duration-100 ease-out disabled:opacity-40',
            item.danger ? 'text-danger hover:bg-dangerSoft' : 'text-fg hover:bg-surface2'
          )}>
          
              {item.icon ? <span className="text-muted">{item.icon}</span> : null}
              <span className="flex-1 truncate">{item.label}</span>
              {item.hint ? <span className="font-mono text-2xs text-faint">{item.hint}</span> : null}
            </button>
        )}
        </div> :
      null}
    </div>);

}