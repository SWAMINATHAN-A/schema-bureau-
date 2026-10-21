export interface Column {
  id: string;
  name: string;
  /** Full display type, e.g. VARCHAR(100) */
  dataType: string;
  /** Normalized base type, e.g. VARCHAR */
  baseType: string;
  params?: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey: boolean;
  unique: boolean;
  autoIncrement: boolean;
  defaultValue?: string;
  line: number;
  raw: string;
}

export interface ForeignKeyConstraint {
  id: string;
  name?: string;
  columns: string[];
  refTable: string;
  refColumns: string[];
  onDelete?: string;
  onUpdate?: string;
  line: number;
  inline: boolean;
}

export interface TableSchema {
  id: string;
  name: string;
  columns: Column[];
  primaryKeys: string[];
  uniqueGroups: string[][];
  foreignKeys: ForeignKeyConstraint[];
  line: number;
  raw: string;
}

export type Cardinality =
'one-to-one' |
'one-to-many' |
'many-to-one' |
'many-to-many' |
'unknown';

export type Confidence = 'high' | 'medium' | 'low';

export interface Relationship {
  id: string;
  sourceTable: string;
  sourceColumn: string;
  targetTable: string;
  targetColumn: string;
  sourceColumns: string[];
  targetColumns: string[];
  type: Cardinality;
  confidence: Confidence;
  selfReferencing: boolean;
  constraintName?: string;
  reason: string;
  onDelete?: string;
  onUpdate?: string;
}

export type DiagnosticSeverity = 'error' | 'warning';

export interface Diagnostic {
  id: string;
  severity: DiagnosticSeverity;
  code: string;
  title: string;
  message: string;
  suggestion?: string;
  line?: number;
  snippet?: string;
}

export type InsightKind = 'error' | 'warning' | 'insight' | 'suggestion' | 'success';

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  detail: string;
  tables?: string[];
}

export interface SchemaStats {
  tables: number;
  columns: number;
  primaryKeys: number;
  foreignKeys: number;
  relationships: number;
  junctionTables: number;
  nullableColumns: number;
  uniqueConstraints: number;
}

export interface ParsedSchema {
  sql: string;
  tables: TableSchema[];
  relationships: Relationship[];
  junctionTables: JunctionTable[];
  diagnostics: Diagnostic[];
  insights: Insight[];
  stats: SchemaStats;
  valid: boolean;
  parsedAt: number;
}

export interface JunctionTable {
  table: string;
  connects: string[];
  reason: string;
}

export interface SimulationStep {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  body: string;
  bullets: string[];
  highlightTables: string[];
  highlightColumns: string[];
  highlightRelationships: string[];
  revealTables: string[];
  revealRelationships: string[];
}

export interface HistoryEntry {
  id: string;
  name: string;
  sql: string;
  createdAt: number;
  updatedAt: number;
  stats: SchemaStats;
  valid: boolean;
  tableNames: string[];
  exampleId?: string;
}

export interface AnalyticsRecord {
  generations: number;
  successes: number;
  failures: number;
  totalTables: number;
  totalRelationships: number;
  exampleLoads: Record<string, number>;
  history: {at: number;tables: number;relationships: number;valid: boolean;}[];
}