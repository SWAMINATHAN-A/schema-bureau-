import React from 'react';
import { cn } from '../../utils/cn';

interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
  as?: 'section' | 'aside' | 'div';
}

export function Panel({
  title,
  subtitle,
  actions,
  className,
  bodyClassName,
  children,
  as: Tag = 'section'
}: PanelProps) {
  return (
    <Tag className={cn('flex min-h-0 flex-col bg-surface', className)}>
      {title ?
      <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-line px-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <h2 className="truncate text-[11px] font-semibold uppercase tracking-[0.09em] text-muted">{title}</h2>
            {subtitle ? <span className="truncate text-2xs text-faint">{subtitle}</span> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
        </header> :
      null}
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </Tag>);

}