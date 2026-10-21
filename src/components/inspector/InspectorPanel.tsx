import React, { useState } from 'react';
import { DatabaseIcon } from 'lucide-react';
import type { ParsedSchema } from '../../types/schema';
import type { Selection } from '../../contexts/SchemaContext';
import { Panel } from '../common/Panel';
import { Tabs } from '../common/Tabs';
import { EmptyState } from '../common/EmptyState';
import { SchemaOverview } from './SchemaOverview';
import { EntityDetails } from './EntityDetails';
import { RelationshipDetails } from './RelationshipDetails';
import { InsightsList } from './InsightsList';
import { TutorPanel } from '../ai/TutorPanel';

interface InspectorPanelProps {
  schema: ParsedSchema | null;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  className?: string;
}

export function InspectorPanel({ schema, selection, onSelect, className }: InspectorPanelProps) {
  const [tab, setTab] = useState('inspect');

  const table =
  schema && selection.kind === 'table' ?
  schema.tables.find((t) => t.name.toLowerCase() === selection.id.toLowerCase()) :
  undefined;
  const relationship =
  schema && selection.kind === 'relationship' ?
  schema.relationships.find((r) => r.id === selection.id) :
  undefined;

  return (
    <Panel
      as="aside"
      title="Inspector"
      className={className}
      actions={
      <Tabs
        ariaLabel="Inspector view"
        size="sm"
        value={tab}
        onChange={setTab}
        items={[
        { id: 'inspect', label: 'Schema' },
        { id: 'health', label: 'Health', count: schema?.insights.length },
        { id: 'tutor', label: 'Tutor' }]
        } />

      }
      bodyClassName={tab === 'tutor' ? 'flex min-h-0' : 'nx-scroll overflow-auto'}>
      
      {tab === 'tutor' ?
      <TutorPanel schema={schema} className="min-h-0 w-full" /> :
      !schema ?
      <EmptyState
        icon={<DatabaseIcon className="h-4 w-4" />}
        title="Nothing to inspect yet"
        description="Generate a diagram and this panel will show the entities, attributes and relationships extracted from your SQL." /> :

      tab === 'health' ?
      <InsightsList insights={schema.insights} /> :
      table ?
      <EntityDetails
        schema={schema}
        table={table}
        onBack={() => onSelect({ kind: 'none' })}
        onSelectRelationship={(id) => onSelect({ kind: 'relationship', id })} /> :

      relationship ?
      <RelationshipDetails
        relationship={relationship}
        onBack={() => onSelect({ kind: 'none' })}
        onSelectTable={(name) => onSelect({ kind: 'table', id: name })} /> :


      <SchemaOverview schema={schema} onSelectTable={(name) => onSelect({ kind: 'table', id: name })} />
      }
    </Panel>);

}