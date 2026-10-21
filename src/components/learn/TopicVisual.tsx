import React from 'react';
import { ArrowRightIcon, CornerDownRightIcon } from 'lucide-react';
import type { LearnTopic } from '../../data/learnTopics';

export function TopicVisual({ visual }: {visual: NonNullable<LearnTopic['visual']>;}) {
  if (visual.kind === 'entity') {
    return (
      <div className="w-64 overflow-hidden rounded border border-line2 bg-surface">
        <div className="border-b border-line bg-surface2 px-3 py-2 text-xs font-semibold tracking-[0.06em] text-fg">
          {visual.left}
        </div>
        <ul className="py-1">
          {(visual.rows ?? []).map((row) =>
          <li key={row} className="whitespace-pre px-3 py-1 font-mono text-[11px] text-muted">
              {row}
            </li>
          )}
        </ul>
      </div>);

  }

  if (visual.kind === 'relationship') {
    return (
      <div className="flex items-center gap-3">
        <Box label={visual.leftCard ?? ''} />
        <div className="flex flex-col items-center">
          <span className="font-mono text-2xs text-accent">{visual.label}</span>
          <ArrowRightIcon className="h-4 w-4 text-line2" aria-hidden />
        </div>
        <Box label={visual.rightCard ?? ''} />
      </div>);

  }

  if (visual.kind === 'junction') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Box label={visual.left ?? ''} />
        <span className="font-mono text-2xs text-faint">1:N</span>
        <Box label={visual.middle ?? ''} accent />
        <span className="font-mono text-2xs text-faint">N:1</span>
        <Box label={visual.right ?? ''} />
      </div>);

  }

  if (visual.kind === 'hierarchy') {
    return (
      <div className="inline-flex flex-col gap-1.5">
        <Box label={visual.left ?? ''} />
        <span className="flex items-center gap-1.5 pl-4 text-2xs text-muted">
          <CornerDownRightIcon className="h-3.5 w-3.5 text-line2" aria-hidden />
          <span className="font-mono">manager_id → employee_id</span>
        </span>
        <div className="pl-8">
          <Box label={visual.left ?? ''} />
        </div>
      </div>);

  }

  return (
    <ol className="w-full max-w-md space-y-1.5">
      {(visual.layers ?? []).map((layer, index) =>
      <li key={layer.title} className="flex items-center gap-3 rounded border border-line bg-surface2 px-3 py-2">
          <span className="font-mono text-2xs text-accent">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-xs font-medium text-fg">{layer.title}</span>
          <span className="text-2xs text-muted">{layer.detail}</span>
        </li>
      )}
    </ol>);

}

function Box({ label, accent }: {label: string;accent?: boolean;}) {
  return (
    <span
      className={`inline-flex h-9 items-center rounded border px-3 font-mono text-xs ${
      accent ? 'border-accent bg-accentSoft text-accent' : 'border-line2 bg-surface text-fg'}`
      }>
      
      {label}
    </span>);

}