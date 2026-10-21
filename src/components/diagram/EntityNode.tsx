import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { GitMergeIcon, KeyIcon, LinkIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { EntityNodeData } from '../../services/diagram/layout';
import { ROW_HEIGHT } from '../../services/diagram/layout';

export function EntityNode({ data, selected }: NodeProps<EntityNodeData>) {
  const { table, isJunction, highlightColumns, dimmed } = data;
  const highlighted = new Set(highlightColumns.map((c) => c.split('.').slice(1).join('.').toLowerCase()));

  return (
    <div
      className={cn(
        'overflow-hidden rounded-md border bg-surface transition-[border-color,opacity,box-shadow] duration-150 ease-out',
        selected ? 'border-accent shadow-[0_0_0_1px_var(--nx-accent)]' : 'border-line2',
        dimmed && 'opacity-35'
      )}
      style={{ width: 272 }}>
      
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <header
        className={cn(
          'flex h-10 items-center justify-between gap-2 border-b px-3',
          selected ? 'border-accent bg-accentSoft' : 'border-line bg-surface2'
        )}>
        
        <span className="truncate text-[12.5px] font-semibold uppercase tracking-[0.06em] text-fg">{table.name}</span>
        <span className="flex shrink-0 items-center gap-1.5">
          {isJunction ?
          <span className="flex items-center gap-1 rounded-sm border border-line px-1 py-px font-mono text-[9px] text-muted">
              <GitMergeIcon className="h-2.5 w-2.5" aria-hidden />
              JUNCTION
            </span> :
          null}
          <span className="font-mono text-[10px] text-faint">{table.columns.length}</span>
        </span>
      </header>

      <ul className="py-1">
        {table.columns.length === 0 ?
        <li className="px-3 py-1 font-mono text-[11px] text-faint">no columns</li> :

        table.columns.map((column) =>
        <li
          key={column.id}
          style={{ height: ROW_HEIGHT }}
          className={cn(
            'flex items-center gap-2 px-3 font-mono text-[11px]',
            highlighted.has(column.name.toLowerCase()) && 'bg-accentSoft'
          )}>
          
              <span className="flex w-6 shrink-0 items-center gap-0.5 text-[9px] font-semibold">
                {column.primaryKey ?
            <KeyIcon className="h-2.5 w-2.5 text-accent" aria-label="Primary key" /> :
            null}
                {column.foreignKey ?
            <LinkIcon className="h-2.5 w-2.5 text-muted" aria-label="Foreign key" /> :
            null}
              </span>
              <span className={cn('flex-1 truncate', column.primaryKey ? 'text-fg' : 'text-muted')}>
                {column.name}
                {!column.nullable ? <span className="ml-1 text-[9px] text-faint">•</span> : null}
              </span>
              <span className="shrink-0 text-[10px] text-faint">{column.dataType}</span>
            </li>
        )
        }
      </ul>
    </div>);

}