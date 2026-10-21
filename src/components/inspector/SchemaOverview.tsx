import React from 'react';
import type { ParsedSchema } from '../../types/schema';
import { generateSchemaSummary } from '../../services/explanationEngine';

interface SchemaOverviewProps {
  schema: ParsedSchema;
  onSelectTable: (name: string) => void;
}

export function SchemaOverview({ schema, onSelectTable }: SchemaOverviewProps) {
  const metrics: {label: string;value: number;}[] = [
  { label: 'Tables', value: schema.stats.tables },
  { label: 'Columns', value: schema.stats.columns },
  { label: 'Primary keys', value: schema.stats.primaryKeys },
  { label: 'Foreign keys', value: schema.stats.foreignKeys },
  { label: 'Relationships', value: schema.stats.relationships },
  { label: 'Junction tables', value: schema.stats.junctionTables }];


  return (
    <div className="p-3">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line">
        {metrics.map((metric) =>
        <div key={metric.label} className="bg-surface px-3 py-2.5">
            <dt className="text-2xs uppercase tracking-[0.07em] text-faint">{metric.label}</dt>
            <dd className="mt-0.5 font-mono text-lg leading-none text-fg">{metric.value}</dd>
          </div>
        )}
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-muted">{generateSchemaSummary(schema)}</p>

      <h3 className="mb-1.5 mt-4 text-2xs font-semibold uppercase tracking-[0.09em] text-faint">Entities</h3>
      <ul className="overflow-hidden rounded border border-line">
        {schema.tables.map((table, index) =>
        <li key={table.id} className={index > 0 ? 'border-t border-line' : ''}>
            <button
            type="button"
            onClick={() => onSelectTable(table.name)}
            className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-surface2">
            
              <span className="truncate font-mono text-xs text-fg">{table.name}</span>
              <span className="shrink-0 font-mono text-2xs text-faint">
                {table.columns.length}c · {table.foreignKeys.length}fk
              </span>
            </button>
          </li>
        )}
      </ul>
    </div>);

}