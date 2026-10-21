export const KNOWN_TYPES = [
'INT',
'INTEGER',
'TINYINT',
'SMALLINT',
'MEDIUMINT',
'BIGINT',
'SERIAL',
'BIGSERIAL',
'SMALLSERIAL',
'DECIMAL',
'NUMERIC',
'FLOAT',
'REAL',
'DOUBLE',
'DOUBLE PRECISION',
'MONEY',
'BIT',
'BOOL',
'BOOLEAN',
'CHAR',
'NCHAR',
'VARCHAR',
'NVARCHAR',
'CHARACTER',
'CHARACTER VARYING',
'TEXT',
'TINYTEXT',
'MEDIUMTEXT',
'LONGTEXT',
'CLOB',
'BLOB',
'BYTEA',
'JSON',
'JSONB',
'UUID',
'XML',
'DATE',
'TIME',
'DATETIME',
'DATETIME2',
'TIMESTAMP',
'TIMESTAMPTZ',
'YEAR',
'INTERVAL',
'ENUM',
'SET'] as
const;

const TYPE_LOOKUP = new Set(KNOWN_TYPES.map((t) => t));

export interface TypeCategoryInfo {
  category: 'numeric' | 'text' | 'temporal' | 'boolean' | 'binary' | 'structured' | 'other';
  known: boolean;
  description: string;
}

export function describeType(baseType: string): TypeCategoryInfo {
  const t = baseType.toUpperCase();
  const known = TYPE_LOOKUP.has(t as (typeof KNOWN_TYPES)[number]);
  if (/^(INT|INTEGER|TINYINT|SMALLINT|MEDIUMINT|BIGINT|SERIAL|BIGSERIAL|SMALLSERIAL|DECIMAL|NUMERIC|FLOAT|REAL|DOUBLE|DOUBLE PRECISION|MONEY|BIT)$/.test(t)) {
    return { category: 'numeric', known, description: 'Numeric value — suited to identifiers, counts, and measurements.' };
  }
  if (/^(CHAR|NCHAR|VARCHAR|NVARCHAR|CHARACTER|CHARACTER VARYING|TEXT|TINYTEXT|MEDIUMTEXT|LONGTEXT|CLOB|ENUM|SET)$/.test(t)) {
    return { category: 'text', known, description: 'Character data — stores names, labels, and free-form text.' };
  }
  if (/^(DATE|TIME|DATETIME|DATETIME2|TIMESTAMP|TIMESTAMPTZ|YEAR|INTERVAL)$/.test(t)) {
    return { category: 'temporal', known, description: 'Temporal value — records a point in time or a duration.' };
  }
  if (/^(BOOL|BOOLEAN)$/.test(t)) {
    return { category: 'boolean', known, description: 'Boolean flag — a two-state true/false attribute.' };
  }
  if (/^(BLOB|BYTEA|BINARY|VARBINARY)$/.test(t)) {
    return { category: 'binary', known, description: 'Binary data — raw bytes such as files or hashes.' };
  }
  if (/^(JSON|JSONB|XML|UUID)$/.test(t)) {
    return { category: 'structured', known, description: 'Structured value — semi-structured or identifier payloads.' };
  }
  return { category: 'other', known, description: 'Dialect-specific or user-defined type.' };
}

export function isKnownType(baseType: string): boolean {
  return TYPE_LOOKUP.has(baseType.toUpperCase() as (typeof KNOWN_TYPES)[number]);
}

export function shortType(dataType: string): string {
  return dataType.replace(/\s+/g, ' ').trim();
}