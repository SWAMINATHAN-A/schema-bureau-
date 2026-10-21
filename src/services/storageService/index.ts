import type { AnalyticsRecord, HistoryEntry, ParsedSchema } from '../../types/schema';
import { uid } from '../../utils/id';

const HISTORY_KEY = 'nexora.history.v1';
const ANALYTICS_KEY = 'nexora.analytics.v1';
const DRAFT_KEY = 'nexora.draft.v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {

    /* storage unavailable — the app keeps working in-memory */}
}

export const StorageService = {
  getHistory(): HistoryEntry[] {
    return read<HistoryEntry[]>(HISTORY_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
  },

  saveSchema(name: string, schema: ParsedSchema, exampleId?: string): HistoryEntry {
    const entry: HistoryEntry = {
      id: uid('hist'),
      name,
      sql: schema.sql,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      stats: schema.stats,
      valid: schema.valid,
      tableNames: schema.tables.map((t) => t.name),
      exampleId
    };
    const all = [entry, ...StorageService.getHistory()].slice(0, 100);
    write(HISTORY_KEY, all);
    return entry;
  },

  loadSchema(id: string): HistoryEntry | undefined {
    return StorageService.getHistory().find((e) => e.id === id);
  },

  renameSchema(id: string, name: string): void {
    write(
      HISTORY_KEY,
      StorageService.getHistory().map((e) => e.id === id ? { ...e, name, updatedAt: Date.now() } : e)
    );
  },

  duplicateSchema(id: string): HistoryEntry | undefined {
    const entry = StorageService.loadSchema(id);
    if (!entry) return undefined;
    const copy: HistoryEntry = {
      ...entry,
      id: uid('hist'),
      name: `${entry.name} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    write(HISTORY_KEY, [copy, ...StorageService.getHistory()]);
    return copy;
  },

  deleteSchema(id: string): void {
    write(
      HISTORY_KEY,
      StorageService.getHistory().filter((e) => e.id !== id)
    );
  },

  clearHistory(): void {
    write(HISTORY_KEY, []);
  },

  getAnalytics(): AnalyticsRecord {
    return read<AnalyticsRecord>(ANALYTICS_KEY, {
      generations: 0,
      successes: 0,
      failures: 0,
      totalTables: 0,
      totalRelationships: 0,
      exampleLoads: {},
      history: []
    });
  },

  recordGeneration(schema: ParsedSchema): void {
    const a = StorageService.getAnalytics();
    a.generations += 1;
    if (schema.valid) a.successes += 1;else
    a.failures += 1;
    a.totalTables += schema.stats.tables;
    a.totalRelationships += schema.stats.relationships;
    a.history = [
    ...a.history,
    { at: Date.now(), tables: schema.stats.tables, relationships: schema.stats.relationships, valid: schema.valid }].
    slice(-60);
    write(ANALYTICS_KEY, a);
  },

  recordExampleLoad(exampleId: string): void {
    const a = StorageService.getAnalytics();
    a.exampleLoads[exampleId] = (a.exampleLoads[exampleId] ?? 0) + 1;
    write(ANALYTICS_KEY, a);
  },

  clearAnalytics(): void {
    write(ANALYTICS_KEY, {
      generations: 0,
      successes: 0,
      failures: 0,
      totalTables: 0,
      totalRelationships: 0,
      exampleLoads: {},
      history: []
    });
  },

  getDraft(): string | null {
    return read<string | null>(DRAFT_KEY, null);
  },

  saveDraft(sql: string): void {
    write(DRAFT_KEY, sql);
  }
};