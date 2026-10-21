import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import type { Diagnostic } from '../../types/schema';

interface ErrorStateProps {
  title: string;
  intro: string;
  diagnostics: Diagnostic[];
  action?: React.ReactNode;
}

export function ErrorState({ title, intro, diagnostics, action }: ErrorStateProps) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangleIcon className="h-4 w-4 text-danger" aria-hidden />
          <h3 className="text-sm font-semibold text-fg">{title}</h3>
        </div>
        <p className="mb-4 text-xs text-muted">{intro}</p>
        <ul className="space-y-2">
          {diagnostics.slice(0, 4).map((d) =>
          <li key={d.id} className="rounded border border-line bg-surface2 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13px] font-medium text-fg">{d.title}</p>
                {d.line ? <span className="shrink-0 font-mono text-2xs text-faint">line {d.line}</span> : null}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{d.message}</p>
              {d.suggestion ? <p className="mt-1.5 text-xs text-accent">{d.suggestion}</p> : null}
            </li>
          )}
        </ul>
        {diagnostics.length > 4 ?
        <p className="mt-2 text-2xs text-faint">+{diagnostics.length - 4} more issue(s) listed in the editor panel.</p> :
        null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>);

}