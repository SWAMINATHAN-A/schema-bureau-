import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_SQL, type ExampleSchema } from '../data/examples';
import { analyzeSql } from '../services/schemaAnalyzer';
import { generateSimulationSteps } from '../services/explanationEngine';
import { StorageService } from '../services/storageService';
import type { HistoryEntry, ParsedSchema, SimulationStep } from '../types/schema';

export type Selection =
{kind: 'none';} |
{kind: 'table';id: string;} |
{kind: 'relationship';id: string;};

export type GenerateStatus = 'idle' | 'analyzing' | 'ready' | 'error';

export interface Stage {
  id: string;
  label: string;
}

export const STAGES: Stage[] = [
{ id: 'read', label: 'Reading SQL' },
{ id: 'tables', label: 'Extracting tables' },
{ id: 'validate', label: 'Validating constraints' },
{ id: 'relationships', label: 'Detecting relationships' },
{ id: 'graph', label: 'Building ER diagram' }];


interface SchemaValue {
  sql: string;
  setSql: (sql: string) => void;
  schema: ParsedSchema | null;
  status: GenerateStatus;
  stageIndex: number;
  schemaName: string;
  setSchemaName: (name: string) => void;
  generate: () => Promise<ParsedSchema>;
  clear: () => void;
  selection: Selection;
  select: (selection: Selection) => void;
  loadExample: (example: ExampleSchema) => void;
  loadHistoryEntry: (entry: HistoryEntry) => void;
  pendingAutoGenerate: boolean;
  consumeAutoGenerate: () => void;
  steps: SimulationStep[];
  stepIndex: number;
  setStepIndex: (index: number) => void;
  simulationActive: boolean;
  setSimulationActive: (active: boolean) => void;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  savedEntryId: string | null;
  saveCurrent: (name?: string) => void;
  historyVersion: number;
  bumpHistory: () => void;
}

const SchemaContext = createContext<SchemaValue | null>(null);

export function SchemaProvider({ children }: {children: React.ReactNode;}) {
  const [sql, setSqlState] = useState<string>(() => StorageService.getDraft() ?? DEFAULT_SQL);
  const [schema, setSchema] = useState<ParsedSchema | null>(null);
  const [status, setStatus] = useState<GenerateStatus>('idle');
  const [stageIndex, setStageIndex] = useState(-1);
  const [schemaName, setSchemaName] = useState('Untitled schema');
  const [selection, setSelection] = useState<Selection>({ kind: 'none' });
  const [stepIndex, setStepIndex] = useState(0);
  const [simulationActive, setSimulationActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [pendingAutoGenerate, setPendingAutoGenerate] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => StorageService.saveDraft(sql), 400);
    return () => window.clearTimeout(id);
  }, [sql]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
    },
    []
  );

  const setSql = useCallback((next: string) => {
    setSqlState(next);
  }, []);

  const generate = useCallback(async () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setStatus('analyzing');
    setSelection({ kind: 'none' });
    setSimulationActive(false);
    setPlaying(false);

    for (let i = 0; i < STAGES.length; i += 1) {
      setStageIndex(i);
      // Yield to the browser so each stage paints; the parse itself is synchronous.
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 70));
    }

    const result = analyzeSql(sql);
    setSchema(result);
    setStepIndex(0);
    setStatus(result.valid ? 'ready' : result.tables.length > 0 ? 'ready' : 'error');
    setStageIndex(-1);
    StorageService.recordGeneration(result);
    setHistoryVersion((v) => v + 1);
    return result;
  }, [sql]);

  const clear = useCallback(() => {
    setSqlState('');
    setSchema(null);
    setStatus('idle');
    setSelection({ kind: 'none' });
    setSimulationActive(false);
    setPlaying(false);
    setSavedEntryId(null);
  }, []);

  const loadExample = useCallback((example: ExampleSchema) => {
    setSqlState(example.sql);
    setSchemaName(example.name);
    setSchema(null);
    setStatus('idle');
    setSelection({ kind: 'none' });
    setSavedEntryId(null);
    setPendingAutoGenerate(true);
    StorageService.recordExampleLoad(example.id);
  }, []);

  const loadHistoryEntry = useCallback((entry: HistoryEntry) => {
    setSqlState(entry.sql);
    setSchemaName(entry.name);
    setSchema(null);
    setStatus('idle');
    setSelection({ kind: 'none' });
    setSavedEntryId(entry.id);
    setPendingAutoGenerate(true);
  }, []);

  const consumeAutoGenerate = useCallback(() => setPendingAutoGenerate(false), []);

  const saveCurrent = useCallback(
    (name?: string) => {
      if (!schema) return;
      const entry = StorageService.saveSchema(name ?? schemaName, schema);
      setSavedEntryId(entry.id);
      setHistoryVersion((v) => v + 1);
    },
    [schema, schemaName]
  );

  const steps = useMemo(() => schema ? generateSimulationSteps(schema) : [], [schema]);

  useEffect(() => {
    if (!playing || !simulationActive) return undefined;
    const id = window.setInterval(() => {
      setStepIndex((i) => {
        if (i >= steps.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 2600);
    return () => window.clearInterval(id);
  }, [playing, simulationActive, steps.length]);

  const value = useMemo<SchemaValue>(
    () => ({
      sql,
      setSql,
      schema,
      status,
      stageIndex,
      schemaName,
      setSchemaName,
      generate,
      clear,
      selection,
      select: setSelection,
      loadExample,
      loadHistoryEntry,
      pendingAutoGenerate,
      consumeAutoGenerate,
      steps,
      stepIndex,
      setStepIndex,
      simulationActive,
      setSimulationActive,
      playing,
      setPlaying,
      savedEntryId,
      saveCurrent,
      historyVersion,
      bumpHistory: () => setHistoryVersion((v) => v + 1)
    }),
    [
    sql,
    setSql,
    schema,
    status,
    stageIndex,
    schemaName,
    generate,
    clear,
    selection,
    loadExample,
    loadHistoryEntry,
    pendingAutoGenerate,
    consumeAutoGenerate,
    steps,
    stepIndex,
    simulationActive,
    playing,
    savedEntryId,
    saveCurrent,
    historyVersion]

  );

  return <SchemaContext.Provider value={value}>{children}</SchemaContext.Provider>;
}

export function useSchema(): SchemaValue {
  const ctx = useContext(SchemaContext);
  if (!ctx) throw new Error('useSchema must be used inside SchemaProvider');
  return ctx;
}