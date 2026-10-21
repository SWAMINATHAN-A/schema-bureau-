import React from 'react';
import { ArrowLeftIcon, KeyIcon, LinkIcon } from 'lucide-react';
import type { ParsedSchema, TableSchema } from '../../types/schema';
import { Badge } from '../common/Badge';
import { explainColumn, explainPrimaryKey, explainTable, explainJunctionTable } from '../../services/explanationEngine';
import { describeType } from '../../services/sqlParser/dataTypes';

interface EntityDetailsProps {
  schema: ParsedSchema;
  table: TableSchema;
  onBack: () => void;
  onSelectRelationship: (id: string) => void;
}

export function EntityDetails({ schema, table, onBack, onSelectRelationship }: EntityDetailsProps) {
  const related = schema.relationships.filter(
    (r) =>
    r.sourceTable.toLowerCase() === table.name.toLowerCase() ||
    r.targetTable.toLowerCase() === table.name.toLowerCase()
  );
  const junction = explainJunctionTable(schema, table.name);

  return (
    <div className="p-3">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 text-2xs text-muted transition-colors duration-150 ease-out hover:text-fg">
        
        <ArrowLeftIcon className="h-3 w-3" aria-hidden />
        Schema overview
      </button>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-mono text-base text-fg">{table.name}</h3>
        <span className="font-mono text-2xs text-faint">line {table.line}</span>
      </div>
      <p className="mt-0.5 text-2xs uppercase tracking-[0.08em] text-faint">
        Entity · {table.columns.length} attributes
      </p>

      <p className="mt-3 text-xs leading-relaxed text-muted">{explainTable(table)}</p>

      {junction ?
      <div className="mt-3 rounded border border-accent bg-accentSoft px-2.5 py-2 text-xs leading-relaxed text-fg">
          {junction}
        </div> :
      null}

      <h4 className="mb-1.5 mt-4 text-2xs font-semibold uppercase tracking-[0.09em] text-faint">Attributes</h4>
      <ul className="space-y-1.5">
        {table.columns.map((column) =>
        <li key={column.id} className="rounded border border-line bg-surface2 px-2.5 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                {column.primaryKey ? <KeyIcon className="h-3 w-3 shrink-0 text-accent" aria-hidden /> : null}
                {column.foreignKey ? <LinkIcon className="h-3 w-3 shrink-0 text-muted" aria-hidden /> : null}
                <span className="truncate font-mono text-xs text-fg">{column.name}</span>
              </span>
              <span className="shrink-0 font-mono text-2xs text-muted">{column.dataType}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {column.primaryKey ? <Badge tone="accent">Primary key</Badge> : null}
              {column.foreignKey ? <Badge tone="neutral">Foreign key</Badge> : null}
              {column.unique && !column.primaryKey ? <Badge tone="neutral">Unique</Badge> : null}
              {!column.nullable ? <Badge tone="neutral">Not null</Badge> : <Badge tone="neutral">Nullable</Badge>}
              {column.autoIncrement ? <Badge tone="neutral">Auto</Badge> : null}
              {column.defaultValue ? <Badge tone="neutral" mono>{`default ${column.defaultValue}`}</Badge> : null}
              <Badge tone="neutral">{describeType(column.baseType).category}</Badge>
            </div>
            <p className="mt-1.5 text-2xs leading-relaxed text-muted">{explainColumn(table, column)}</p>
          </li>
        )}
      </ul>

      <h4 className="mb-1.5 mt-4 text-2xs font-semibold uppercase tracking-[0.09em] text-faint">Identity</h4>
      <p className="text-xs leading-relaxed text-muted">{explainPrimaryKey(table)}</p>

      <h4 className="mb-1.5 mt-4 text-2xs font-semibold uppercase tracking-[0.09em] text-faint">
        Relationships ({related.length})
      </h4>
      {related.length === 0 ?
      <p className="text-xs text-muted">This entity is not connected to any other entity in the current schema.</p> :

      <ul className="space-y-1">
          {related.map((rel) =>
        <li key={rel.id}>
              <button
            type="button"
            onClick={() => onSelectRelationship(rel.id)}
            className="w-full rounded border border-line px-2.5 py-1.5 text-left transition-colors duration-150 ease-out hover:border-line2 hover:bg-surface2">
            
                <span className="block truncate font-mono text-2xs text-fg">
                  {rel.sourceTable}.{rel.sourceColumn} → {rel.targetTable}.{rel.targetColumn}
                </span>
                <span className="mt-0.5 block text-2xs text-faint">{rel.type}</span>
              </button>
            </li>
        )}
        </ul>
      }
    </div>);

}