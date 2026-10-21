import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckIcon, DatabaseIcon, SaveIcon, TableIcon, ActivityIcon } from 'lucide-react';
import { EditorPanel } from '../components/editor/EditorPanel';
import { DiagramCanvas } from '../components/diagram/DiagramCanvas';
import { ChenDiagramCanvas } from '../components/diagram/ChenDiagramCanvas';
import { InspectorPanel } from '../components/inspector/InspectorPanel';
import { SimulationBar } from '../components/simulation/SimulationBar';
import { ExportMenu } from '../components/layout/ExportMenu';
import { Panel } from '../components/common/Panel';
import { Tabs } from '../components/common/Tabs';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { useSchema, STAGES } from '../contexts/SchemaContext';
import type { DiagramGeometry } from '../services/exportService';
import { cn } from '../utils/cn';

export function Workspace() {
  const {
    sql,
    setSql,
    schema,
    status,
    stageIndex,
    generate,
    clear,
    selection,
    select,
    loadExample,
    schemaName,
    setSchemaName,
    pendingAutoGenerate,
    consumeAutoGenerate,
    steps,
    stepIndex,
    setStepIndex,
    simulationActive,
    setSimulationActive,
    playing,
    setPlaying,
    saveCurrent,
    savedEntryId
  } = useSchema();

  const [geometry, setGeometry] = useState<DiagramGeometry>({ nodes: [], edges: [] });
  const [fullscreen, setFullscreen] = useState(false);
  const [mobileTab, setMobileTab] = useState('sql');
  const [toast, setToast] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [notation, setNotation] = useState<'modern' | 'chen'>('modern');

  useEffect(() => {
    if (!pendingAutoGenerate) return;
    consumeAutoGenerate();
    void generate();
  }, [pendingAutoGenerate, consumeAutoGenerate, generate]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const step = simulationActive ? steps[stepIndex] : undefined;
  const visibleTables = step ? step.revealTables : undefined;
  const visibleRelationships = step ? step.revealRelationships : undefined;
  const highlightColumns = step ? step.highlightColumns : undefined;
  const animatedRelationships = step ? step.highlightRelationships : undefined;

  const onGeometry = useCallback((next: DiagramGeometry) => setGeometry(next), []);

  const handleGenerate = useCallback(async () => {
    const result = await generate();
    setMobileTab('diagram');
    if (!result.valid && result.tables.length === 0) setToast('Could not build a diagram — see validation for details.');
  }, [generate]);

  const canvas = useMemo(() => {
    if (status === 'analyzing') return <LoadingState stages={STAGES} activeIndex={stageIndex} />;
    if (!schema)
    return (
      <EmptyState
        icon={<TableIcon className="h-4 w-4" />}
        title="Your schema visualization will appear here"
        description="Paste SQL into the editor or load a sample schema, then generate to see entities, attributes and inferred relationships."
        action={
        <Button size="sm" variant="primary" onClick={handleGenerate}>
              Generate ER Diagram
            </Button>
        }
        hint="Tip: press ⌘↵ inside the editor to generate." />);


    if (schema.tables.length === 0)
    return (
      <ErrorState
        title="Unable to Generate Diagram"
        intro="We found an issue in your SQL, so no entities could be extracted."
        diagnostics={schema.diagnostics} />);


    if (notation === 'chen') {
      return (
        <ChenDiagramCanvas
          schema={schema}
          selection={selection}
          onSelect={select}
          onGeometry={onGeometry}
          visibleTables={visibleTables}
          visibleRelationships={visibleRelationships}
          highlightColumns={highlightColumns}
          fullscreen={fullscreen}
          onToggleFullscreen={() => setFullscreen((v) => !v)} />
      );
    }

    return (
      <DiagramCanvas
        schema={schema}
        selection={selection}
        onSelect={select}
        visibleTables={visibleTables}
        visibleRelationships={visibleRelationships}
        highlightColumns={highlightColumns}
        animatedRelationships={animatedRelationships}
        onGeometry={onGeometry}
        fullscreen={fullscreen}
        onToggleFullscreen={() => setFullscreen((v) => !v)} />);


  }, [
  status,
  stageIndex,
  schema,
  selection,
  select,
  visibleTables,
  visibleRelationships,
  highlightColumns,
  animatedRelationships,
  onGeometry,
  fullscreen,
  handleGenerate,
  notation]
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="foundry-workspace-head">
        <div className="foundry-breadcrumb"><span className="foundry-overline">WORKBENCH</span><span className="foundry-slash">/</span><input value={schemaName} onChange={(event) => setSchemaName(event.target.value)} aria-label="Schema name" className="foundry-schema-name" /></div>
        <DatabaseIcon className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
        {schema ?
        <span className="foundry-schema-stats">
            <ActivityIcon className="h-3.5 w-3.5" />
            <span>{schema.stats.tables} tables</span>
            <span>·</span>
            <span>{schema.stats.relationships} relationships</span>
            <span>·</span>
            <span className={schema.valid ? 'text-ok' : 'text-danger'}>
              {schema.valid ? 'valid' : `${schema.diagnostics.filter((d) => d.severity === 'error').length} errors`}
            </span>
          </span> :
        <span className="foundry-schema-stats muted"><ActivityIcon className="h-3.5 w-3.5" /> READY FOR INPUT</span>}

        <span className="flex-1" />

        <div className="foundry-notation-switch" aria-label="ER notation">
          <span className="foundry-switch-label">NOTATION</span>
          <button type="button" className={notation === 'modern' ? 'active' : ''} onClick={() => setNotation('modern')}>MODERN</button>
          <button type="button" className={notation === 'chen' ? 'active' : ''} onClick={() => setNotation('chen')}>CHEN</button>
        </div>
        <Button
          size="sm"
          onClick={() => {
            saveCurrent();
            setJustSaved(true);
            window.setTimeout(() => setJustSaved(false), 1800);
          }}
          disabled={!schema}
          icon={justSaved ? <CheckIcon className="h-3.5 w-3.5" /> : <SaveIcon className="h-3.5 w-3.5" />}>
          
          {justSaved ? 'Saved' : savedEntryId ? 'Save copy' : 'Save'}
        </Button>
        <ExportMenu schema={schema} geometry={geometry} name={schemaName} notation={notation} onError={setToast} />
      </div>

      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-line bg-surface px-2 lg:hidden">
        <Tabs
          ariaLabel="Workspace panel"
          value={mobileTab}
          onChange={setMobileTab}
          items={[
          { id: 'sql', label: 'SQL' },
          { id: 'diagram', label: 'Diagram' },
          { id: 'inspector', label: 'Inspector' }]
          } />
        
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(300px,25%)_1fr_minmax(288px,23%)]">
          <EditorPanel
            className={cn('min-h-0 border-line lg:border-r', mobileTab === 'sql' ? 'flex' : 'hidden lg:flex')}
            sql={sql}
            onChange={setSql}
            onGenerate={handleGenerate}
            onClear={clear}
            onLoadExample={loadExample}
            schema={schema}
            busy={status === 'analyzing'} />
          

          <Panel
            title={notation === 'chen' ? 'Chen ER Diagram' : 'Relational Map'}
            subtitle={schema ? `${schema.stats.tables} entities · ${notation === 'chen' ? 'conceptual notation' : 'relational notation'}` : 'no schema generated'}
            className={cn(
              'min-h-0 bg-bg',
              fullscreen && 'fixed inset-0 z-40 bg-bg',
              mobileTab === 'diagram' ? 'flex' : 'hidden lg:flex'
            )}
            bodyClassName="min-h-0">
            
            {canvas}
          </Panel>

          <InspectorPanel
            className={cn(
              'min-h-0 border-line lg:border-l',
              mobileTab === 'inspector' ? 'flex' : 'hidden lg:flex'
            )}
            schema={schema}
            selection={selection}
            onSelect={select} />
          
        </div>

        <SimulationBar
          steps={steps}
          index={stepIndex}
          active={simulationActive}
          playing={playing}
          disabled={!schema || schema.tables.length === 0}
          onStart={() => {
            setSimulationActive(true);
            setStepIndex(0);
            setMobileTab('diagram');
          }}
          onExit={() => {
            setSimulationActive(false);
            setPlaying(false);
          }}
          onIndex={(index) => {
            setPlaying(false);
            setStepIndex(index);
          }}
          onPlayToggle={() => setPlaying(!playing)}
          onRestart={() => {
            setStepIndex(0);
            setPlaying(false);
          }} />
        
      </div>

      {toast ?
      <div
        role="status"
        className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded border border-line bg-elevated px-3 py-2 text-xs text-fg shadow-2xl">
        
          {toast}
        </div> :
      null}
    </div>);

}