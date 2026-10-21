import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  hint?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, hint }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
      {icon ?
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface2 text-muted">
          {icon}
        </div> :
      null}
      <h3 className="text-sm font-medium text-fg">{title}</h3>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
      {hint ? <div className="mt-5 text-2xs text-faint">{hint}</div> : null}
    </div>);

}