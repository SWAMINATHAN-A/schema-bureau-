import React from 'react';
import { AlertCircleIcon, AlertTriangleIcon, CheckCircle2Icon } from 'lucide-react';
import type { Diagnostic } from '../../types/schema';

interface ValidationListProps {
  diagnostics: Diagnostic[];
  hasSchema: boolean;
}

export function ValidationList({ diagnostics, hasSchema }: ValidationListProps) {
  if (!hasSchema) {
    return (
      <p className="px-3 py-3 text-xs text-faint">
        Validation results appear here after you generate a diagram.
      </p>);

  }

  if (diagnostics.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-3 text-xs text-ok">
        <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Schema parsed with no errors or warnings.
      </div>);

  }

  return (
    <ul className="nx-scroll max-h-full divide-y divide-line overflow-auto">
      {diagnostics.map((d) =>
      <li key={d.id} className="px-3 py-2.5">
          <div className="flex items-start gap-2">
            {d.severity === 'error' ?
          <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-danger" aria-hidden /> :

          <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warn" aria-hidden />
          }
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-xs font-medium text-fg">{d.title}</p>
                {d.line ? <span className="shrink-0 font-mono text-2xs text-faint">L{d.line}</span> : null}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{d.message}</p>
              {d.snippet ?
            <pre className="mt-1.5 overflow-x-auto rounded-sm border border-line bg-surface2 px-2 py-1 font-mono text-2xs text-muted">
                  {d.snippet}
                </pre> :
            null}
              {d.suggestion ? <p className="mt-1 text-2xs text-accent">{d.suggestion}</p> : null}
            </div>
          </div>
        </li>
      )}
    </ul>);

}