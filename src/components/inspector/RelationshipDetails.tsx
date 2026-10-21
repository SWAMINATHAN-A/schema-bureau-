import React from 'react';
import { ArrowDownIcon, ArrowLeftIcon } from 'lucide-react';
import type { Relationship } from '../../types/schema';
import { Badge } from '../common/Badge';
import { cardinalityLabel, explainRelationship } from '../../services/explanationEngine';

interface RelationshipDetailsProps {
  relationship: Relationship;
  onBack: () => void;
  onSelectTable: (name: string) => void;
}

export function RelationshipDetails({ relationship, onBack, onSelectTable }: RelationshipDetailsProps) {
  return (
    <div className="p-3">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 text-2xs text-muted transition-colors duration-150 ease-out hover:text-fg">
        
        <ArrowLeftIcon className="h-3 w-3" aria-hidden />
        Schema overview
      </button>

      <h3 className="text-sm font-semibold text-fg">Relationship</h3>
      <p className="mt-0.5 text-2xs uppercase tracking-[0.08em] text-faint">
        {relationship.selfReferencing ? 'Self-referencing' : 'Foreign key derived'}
        {relationship.constraintName ? ` · ${relationship.constraintName}` : ''}
      </p>

      <div className="mt-3 rounded border border-line bg-surface2 p-3">
        <button
          type="button"
          onClick={() => onSelectTable(relationship.sourceTable)}
          className="block w-full text-left font-mono text-xs text-fg hover:text-accent">
          
          {relationship.sourceTable}.{relationship.sourceColumn}
        </button>
        <ArrowDownIcon className="my-1.5 h-3.5 w-3.5 text-accent" aria-hidden />
        <button
          type="button"
          onClick={() => onSelectTable(relationship.targetTable)}
          className="block w-full text-left font-mono text-xs text-fg hover:text-accent">
          
          {relationship.targetTable}.{relationship.targetColumn}
        </button>
      </div>

      <h4 className="mb-1.5 mt-4 text-2xs font-semibold uppercase tracking-[0.09em] text-faint">Inferred cardinality</h4>
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="accent">{cardinalityLabel(relationship)}</Badge>
        <Badge tone={relationship.confidence === 'high' ? 'ok' : relationship.confidence === 'medium' ? 'warn' : 'neutral'}>
          {relationship.confidence} confidence
        </Badge>
      </div>

      <h4 className="mb-1.5 mt-4 text-2xs font-semibold uppercase tracking-[0.09em] text-faint">Reason</h4>
      <p className="text-xs leading-relaxed text-muted">{explainRelationship(relationship)}</p>

      {relationship.onDelete || relationship.onUpdate ?
      <>
          <h4 className="mb-1.5 mt-4 text-2xs font-semibold uppercase tracking-[0.09em] text-faint">
            Referential actions
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {relationship.onDelete ? <Badge mono>ON DELETE {relationship.onDelete}</Badge> : null}
            {relationship.onUpdate ? <Badge mono>ON UPDATE {relationship.onUpdate}</Badge> : null}
          </div>
        </> :
      null}

      <p className="mt-4 border-t border-line pt-3 text-2xs leading-relaxed text-faint">
        Cardinality here is an inference drawn from constraints in your SQL. Business rules that are not expressed in
        the schema could constrain it further.
      </p>
    </div>);

}