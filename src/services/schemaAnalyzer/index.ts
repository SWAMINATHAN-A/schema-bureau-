import type { ParsedSchema, SchemaStats } from '../../types/schema';
import { SQLParserService } from '../sqlParser/parser';
import { generateInsights } from './insights';
import { RelationshipAnalyzer } from './relationshipAnalyzer';
import { SchemaValidator } from './validator';

export { RelationshipAnalyzer } from './relationshipAnalyzer';
export { SchemaValidator } from './validator';

/**
 * The single pipeline every diagram in SCHEMA BUREAU comes from:
 * SQL text → parse → validate → relationship analysis → insights.
 */
export function analyzeSql(sql: string): ParsedSchema {
  const empty = SchemaValidator.validateEmpty(sql);
  if (empty) {
    return {
      sql,
      tables: [],
      relationships: [],
      junctionTables: [],
      diagnostics: [empty],
      insights: [],
      stats: emptyStats(),
      valid: false,
      parsedAt: Date.now()
    };
  }

  const parsed = SQLParserService.parse(sql);
  const validation = SchemaValidator.validate(parsed.tables, sql);
  const diagnostics = [...parsed.diagnostics, ...validation];

  const relationships = RelationshipAnalyzer.detectRelationships(parsed.tables);
  const junctionTables = RelationshipAnalyzer.detectJunctionTables(parsed.tables);
  const insights = generateInsights(parsed.tables, relationships, junctionTables, diagnostics);

  parsed.skippedStatements.forEach((s) => {
    diagnostics.push({
      id: `skip_${s.line}_${s.keyword}`,
      severity: 'warning',
      code: 'UNSUPPORTED_STATEMENT',
      title: `Skipped statement: ${s.keyword}`,
      message: `SCHEMA BUREAU models CREATE TABLE definitions only. The ${s.keyword} statement on line ${s.line} was ignored.`,
      line: s.line
    });
  });

  const stats: SchemaStats = {
    tables: parsed.tables.length,
    columns: parsed.tables.reduce((sum, t) => sum + t.columns.length, 0),
    primaryKeys: parsed.tables.reduce((sum, t) => sum + t.primaryKeys.length, 0),
    foreignKeys: parsed.tables.reduce((sum, t) => sum + t.foreignKeys.length, 0),
    relationships: relationships.length,
    junctionTables: junctionTables.length,
    nullableColumns: parsed.tables.reduce(
      (sum, t) => sum + t.columns.filter((c) => c.nullable).length,
      0
    ),
    uniqueConstraints: parsed.tables.reduce((sum, t) => sum + t.uniqueGroups.length, 0)
  };

  const hasError = diagnostics.some((d) => d.severity === 'error');

  return {
    sql,
    tables: parsed.tables,
    relationships,
    junctionTables,
    diagnostics,
    insights,
    stats,
    valid: !hasError && parsed.tables.length > 0,
    parsedAt: Date.now()
  };
}

export function emptyStats(): SchemaStats {
  return {
    tables: 0,
    columns: 0,
    primaryKeys: 0,
    foreignKeys: 0,
    relationships: 0,
    junctionTables: 0,
    nullableColumns: 0,
    uniqueConstraints: 0
  };
}