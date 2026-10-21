import React from 'react';
import { CheckIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Stage } from '../../contexts/SchemaContext';

interface LoadingStateProps {
  stages: Stage[];
  activeIndex: number;
  title?: string;
}

export function LoadingState({ stages, activeIndex, title = 'Analyzing schema' }: LoadingStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="w-60">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.09em] text-muted">{title}</p>
        <ol className="space-y-2.5">
          {stages.map((stage, index) => {
            const done = index < activeIndex;
            const active = index === activeIndex;
            return (
              <li key={stage.id} className="flex items-center gap-2.5 text-[13px]">
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ease-out',
                    done && 'border-ok bg-okSoft text-ok',
                    active && 'border-accent text-accent',
                    !done && !active && 'border-line text-faint'
                  )}>
                  
                  {done ?
                  <CheckIcon className="h-2.5 w-2.5" /> :
                  active ?
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> :
                  null}
                </span>
                <span className={cn(done ? 'text-muted' : active ? 'text-fg' : 'text-faint')}>{stage.label}</span>
              </li>);

          })}
        </ol>
      </div>
    </div>);

}