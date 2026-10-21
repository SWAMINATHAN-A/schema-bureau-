import React from 'react';
import { cn } from '../../utils/cn';
import { Tooltip } from './Tooltip';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  size?: 'sm' | 'md';
}

export function IconButton({ label, active, size = 'md', className, children, ...rest }: IconButtonProps) {
  return (
    <Tooltip content={label}>
      <button
        {...rest}
        aria-label={label}
        aria-pressed={active}
        className={cn(
          'inline-flex items-center justify-center rounded border transition-colors duration-150 ease-out disabled:opacity-40 disabled:cursor-not-allowed',
          size === 'sm' ? 'h-6 w-6' : 'h-8 w-8',
          active ?
          'border-accent bg-accentSoft text-accent' :
          'border-transparent text-muted hover:text-fg hover:bg-surface2 hover:border-line',
          className
        )}>
        
        {children}
      </button>
    </Tooltip>);

}