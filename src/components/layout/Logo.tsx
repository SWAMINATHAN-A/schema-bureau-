import React from 'react';
import { cn } from '../../utils/cn';

/** The SCHEMA BUREAU mark: three stacked entity rows resolving into a linked node. */
export function LogoMark({ className }: {className?: string;}) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-5 w-5', className)} aria-hidden focusable="false">
      <rect x="2.5" y="3.5" width="9" height="4" rx="1" className="fill-none stroke-current" strokeWidth="1.4" />
      <rect x="2.5" y="16.5" width="9" height="4" rx="1" className="fill-none stroke-current" strokeWidth="1.4" />
      <rect x="14" y="10" width="7.5" height="4" rx="1" className="fill-current" opacity="0.9" />
      <path d="M11.5 5.5H14v5.5M11.5 18.5H14V14" className="fill-none stroke-current" strokeWidth="1.4" />
    </svg>);

}

export function Wordmark({ size = 'md', className }: {size?: 'sm' | 'md';className?: string;}) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <LogoMark className={size === 'sm' ? 'h-4 w-4 text-accent' : 'h-5 w-5 text-accent'} />
      <span className={cn('font-semibold tracking-[0.16em] text-fg', size === 'sm' ? 'text-xs' : 'text-sm')}>
        SCHEMA BUREAU
      </span>
    </span>);

}