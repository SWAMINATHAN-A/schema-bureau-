import React, { useState } from 'react';
import { cn } from '../../utils/cn';

interface TooltipProps {
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  className?: string;
}

export function Tooltip({ content, side = 'bottom', children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}>
      
      {children}
      {open && content ?
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded border border-line bg-elevated px-2 py-1 text-2xs text-fg shadow-lg',
          side === 'bottom' && 'top-full left-1/2 mt-1.5 -translate-x-1/2',
          side === 'top' && 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
          side === 'left' && 'right-full top-1/2 mr-1.5 -translate-y-1/2',
          side === 'right' && 'left-full top-1/2 ml-1.5 -translate-y-1/2',
          className
        )}>
        
          {content}
        </span> :
      null}
    </span>);

}