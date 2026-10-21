import React from 'react';
import { AlertTriangleIcon, CheckCircle2Icon, InfoIcon, LightbulbIcon, XCircleIcon } from 'lucide-react';
import type { Insight, InsightKind } from '../../types/schema';
import { cn } from '../../utils/cn';

const CONFIG: Record<InsightKind, {icon: React.ReactNode;label: string;className: string;}> = {
  error: { icon: <XCircleIcon className="h-3.5 w-3.5" />, label: 'Error', className: 'text-danger border-danger' },
  warning: {
    icon: <AlertTriangleIcon className="h-3.5 w-3.5" />,
    label: 'Warning',
    className: 'text-warn border-warn'
  },
  insight: { icon: <InfoIcon className="h-3.5 w-3.5" />, label: 'Insight', className: 'text-accent border-accent' },
  suggestion: {
    icon: <LightbulbIcon className="h-3.5 w-3.5" />,
    label: 'Suggestion',
    className: 'text-muted border-line2'
  },
  success: { icon: <CheckCircle2Icon className="h-3.5 w-3.5" />, label: 'Healthy', className: 'text-ok border-ok' }
};

export function InsightsList({ insights }: {insights: Insight[];}) {
  if (insights.length === 0) {
    return <p className="p-3 text-xs text-faint">No insights yet — generate a diagram to analyze schema health.</p>;
  }

  return (
    <ul className="space-y-1.5 p-3">
      {insights.map((insight) => {
        const config = CONFIG[insight.kind];
        return (
          <li key={insight.id} className="rounded border border-line bg-surface2 p-2.5">
            <div className="flex items-start gap-2">
              <span className={cn('mt-0.5 shrink-0', config.className.split(' ')[0])} aria-hidden>
                {config.icon}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'rounded-sm border px-1 py-px text-[9px] font-semibold uppercase tracking-[0.06em]',
                      config.className
                    )}>
                    
                    {config.label}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium leading-snug text-fg">{insight.title}</p>
                <p className="mt-1 text-2xs leading-relaxed text-muted">{insight.detail}</p>
              </div>
            </div>
          </li>);

      })}
    </ul>);

}