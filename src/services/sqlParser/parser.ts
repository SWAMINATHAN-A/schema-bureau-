import type { Column, Diagnostic, ForeignKeyConstraint, TableSchema } from '../../types/schema';
import { isKnownType } from './dataTypes';
import {
  cleanIdentifier,
  lineAt,
  matchParen,
  parenBalance,
  splitIdentifierList,
  splitStatements,
  splitTopLevel,
  stripComments } from
'./tokenizer';

export interface ParseResult {
  tables: TableSchema[];
  diagnostics: Diagnostic[];
  statementCount: number;
  createStatementCount: number;
  skippedStatements: {keyword: string;line: number;}[];
}

const CREATE_TABLE_RE =
/^\s*CREATE\s+(?:OR\s+REPLACE\s+)?(?:GLOBAL\s+|LOCAL\s+)?(?:TEMP(?:ORARY)?\s+|UNLOGGED\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"[\]\w.$]+)/i;

const TYPE_RE =
/^((?:DOUBLE\s+PRECISION|CHARACTER\s+VARYING|TIMESTAMP\s+WITH(?:OUT)?\s+TIME\s+ZONE|TIME\s+WITH(?:OUT)?\s+TIME\s+ZONE|UNSIGNED\s+[A-Z]+|[A-Za-z_][A-Za-z0-9_]*))\s*(\([^)]*\))?/i;

/** Constraints that can never be confused with a column name. */
const STRONG_CONSTRAINT_START = /^\s*(CONSTRAINT\s+[`"[\]\w$]+\s+)?(PRIMARY\s+KEY|FOREIGN\s+KEY)\b/i;
/** Keywords that could also be a column name — only treated as constraints when followed by a column list. */
const WEAK_CONSTRAINT_START =
/^\s*(CONSTRAINT\s+[`"[\]\w$]+\s+)?(UNIQUE(\s+KEY)?|CHECK|KEY|INDEX|FULLTEXT|EXCLUDE)\b/i;

function isTableConstraint(text: string): boolean {
  if (STRONG_CONSTRAINT_START.test(text)) return true;
  return WEAK_CONSTRAINT_START.test(text) && text.includes('(');
}

let diagCounter = 0;
function diagId(): string {
  diagCounter += 1;
  return `diag_${diagCounter}`;
}

/**
 * SQLParserService — a dialect-tolerant CREATE TABLE parser.
 * It never inspects table names for "known" schemas; every table, column and
 * constraint below is derived purely from the supplied text.
 */
export const SQLParserService = {
  stripComments,
  tokenize(sql: string) {
    return splitStatements(stripComments(sql));
  },
  parse(input: string): ParseResult {
    const diagnostics: Diagnostic[] = [];
    const tables: TableSchema[] = [];
    const skippedStatements: {keyword: string;line: number;}[] = [];

    const sql = stripComments(input);

    const balance = parenBalance(sql);
    if (balance !== 0) {
      diagnostics.push({
        id: diagId(),
        severity: 'error',
        code: 'UNBALANCED_PARENS',
        title: 'Unmatched parentheses',
        message:
        balance > 0 ?
        `${balance} opening parenthesis${balance > 1 ? 'es are' : ' is'} never closed.` :
        `${Math.abs(balance)} closing parenthesis${Math.abs(balance) > 1 ? 'es have' : ' has'} no matching opening parenthesis.`,
        suggestion: 'Balance the parentheses around your column definitions and try again.'
      });
    }

    const statements = splitStatements(sql);
    let createCount = 0;

    statements.forEach((statement) => {
      const trimmed = statement.text.trim();
      if (!trimmed) return;
      const line = lineAt(input, statement.start + (statement.text.length - statement.text.trimStart().length));

      const match = trimmed.match(CREATE_TABLE_RE);
      if (!match) {
        const keyword = trimmed.split(/\s+/).slice(0, 2).join(' ').toUpperCase();
        skippedStatements.push({ keyword, line });
        return;
      }

      createCount += 1;
      const tableName = cleanIdentifier(match[1]);
      const openIndex = statement.text.indexOf('(', statement.text.toUpperCase().indexOf(match[1].toUpperCase()));
      if (openIndex === -1) {
        diagnostics.push({
          id: diagId(),
          severity: 'error',
          code: 'MISSING_BODY',
          title: `Table "${tableName}" has no column list`,
          message: 'A CREATE TABLE statement must define its columns inside parentheses.',
          suggestion: `Write CREATE TABLE ${tableName} ( ... );`,
          line,
          snippet: trimmed.slice(0, 80)
        });
        return;
      }
      const closeIndex = matchParen(statement.text, openIndex);
      if (closeIndex === -1) {
        diagnostics.push({
          id: diagId(),
          severity: 'error',
          code: 'UNCLOSED_BODY',
          title: `Table "${tableName}" is not closed`,
          message: 'The column list opened with "(" is never closed with ")".',
          suggestion: 'Add the missing closing parenthesis before the semicolon.',
          line,
          snippet: trimmed.slice(0, 80)
        });
        return;
      }

      const body = statement.text.slice(openIndex + 1, closeIndex);
      const bodyOffset = statement.start + openIndex + 1;
      const parts = splitTopLevel(body, bodyOffset);

      const table: TableSchema = {
        id: `tbl_${tableName.toLowerCase()}`,
        name: tableName,
        columns: [],
        primaryKeys: [],
        uniqueGroups: [],
        foreignKeys: [],
        line,
        raw: statement.text.trim()
      };

      if (parts.length === 0) {
        diagnostics.push({
          id: diagId(),
          severity: 'error',
          code: 'EMPTY_TABLE',
          title: `Table "${tableName}" defines no columns`,
          message: 'An entity requires at least one attribute to be meaningful.',
          suggestion: 'Add at least one column definition inside the parentheses.',
          line
        });
      }

      parts.forEach((part) => {
        const text = part.text.trim();
        if (!text) return;
        const partLine = lineAt(input, part.start + (part.text.length - part.text.trimStart().length));

        if (isTableConstraint(text)) {
          parseTableConstraint(text, partLine, table, diagnostics);
          return;
        }

        const column = parseColumn(text, partLine, table, diagnostics);
        if (column) table.columns.push(column);
      });

      // Reconcile table-level PKs onto columns
      table.primaryKeys.forEach((pk) => {
        const col = table.columns.find((c) => eq(c.name, pk));
        if (col) {
          col.primaryKey = true;
          col.nullable = false;
        }
      });
      table.columns.forEach((col) => {
        if (col.primaryKey && !table.primaryKeys.some((pk) => eq(pk, col.name))) {
          table.primaryKeys.push(col.name);
        }
      });
      table.foreignKeys.forEach((fk) => {
        fk.columns.forEach((name) => {
          const col = table.columns.find((c) => eq(c.name, name));
          if (col) col.foreignKey = true;
        });
      });
      table.uniqueGroups.forEach((group) => {
        if (group.length === 1) {
          const col = table.columns.find((c) => eq(c.name, group[0]));
          if (col) col.unique = true;
        }
      });
      table.columns.forEach((col) => {
        if (col.unique && !table.uniqueGroups.some((g) => g.length === 1 && eq(g[0], col.name))) {
          table.uniqueGroups.push([col.name]);
        }
      });

      tables.push(table);
    });

    if (createCount === 0 && diagnostics.every((d) => d.code !== 'UNBALANCED_PARENS')) {
      diagnostics.push({
        id: diagId(),
        severity: 'error',
        code: 'NO_CREATE_TABLE',
        title: 'No CREATE TABLE statement found',
        message:
        skippedStatements.length > 0 ?
        `SCHEMA BUREAU reads CREATE TABLE definitions. Found ${skippedStatements.length} other statement(s) instead (${skippedStatements.
        map((s) => s.keyword).
        slice(0, 3).
        join(', ')}).` :
        'SCHEMA BUREAU builds ER diagrams from CREATE TABLE definitions.',
        suggestion: 'Paste one or more CREATE TABLE statements, or load an example schema.'
      });
    }

    return { tables, diagnostics, statementCount: statements.length, createStatementCount: createCount, skippedStatements };
  }
};

function eq(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function parseColumn(
text: string,
line: number,
table: TableSchema,
diagnostics: Diagnostic[])
: Column | null {
  const nameMatch = text.match(/^\s*([`"[]?[\w$]+[`"\]]?)/);
  if (!nameMatch) {
    diagnostics.push({
      id: diagId(),
      severity: 'error',
      code: 'BAD_COLUMN',
      title: `Unreadable definition in "${table.name}"`,
      message: `SCHEMA BUREAU could not read "${text.slice(0, 60)}" as a column or constraint.`,
      suggestion: 'A column is written as: column_name DATA_TYPE [constraints].',
      line,
      snippet: text.trim().slice(0, 80)
    });
    return null;
  }
  const name = cleanIdentifier(nameMatch[1]);
  let rest = text.slice(nameMatch[0].length).trim();

  const typeMatch = rest.match(TYPE_RE);
  let baseType = '';
  let params: string | undefined;
  if (typeMatch) {
    baseType = typeMatch[1].replace(/\s+/g, ' ').toUpperCase();
    params = typeMatch[2] ? typeMatch[2].replace(/\s+/g, '') : undefined;
    rest = rest.slice(typeMatch[0].length).trim();
  } else {
    diagnostics.push({
      id: diagId(),
      severity: 'warning',
      code: 'MISSING_TYPE',
      title: `Column "${table.name}.${name}" has no data type`,
      message: 'Every attribute should declare a data type so its domain is defined.',
      suggestion: `Try: ${name} VARCHAR(100)`,
      line,
      snippet: text.trim().slice(0, 80)
    });
    baseType = 'UNKNOWN';
  }

  if (baseType !== 'UNKNOWN' && !isKnownType(baseType)) {
    diagnostics.push({
      id: diagId(),
      severity: 'warning',
      code: 'UNKNOWN_TYPE',
      title: `Unrecognized data type "${baseType}"`,
      message: `"${table.name}.${name}" uses a type SCHEMA BUREAU does not recognize. It is kept as-is in the model.`,
      suggestion: 'This may be a dialect-specific or user-defined type — no action needed if intentional.',
      line
    });
  }

  const upper = rest.toUpperCase();
  const primaryKey = /\bPRIMARY\s+KEY\b/.test(upper);
  const notNull = /\bNOT\s+NULL\b/.test(upper);
  const explicitNull = /(^|\s)NULL\b/.test(upper.replace(/NOT\s+NULL/g, '')) && !/DEFAULT\s+NULL/.test(upper);
  const unique = /\bUNIQUE\b/.test(upper);
  const autoIncrement = /\b(AUTO_INCREMENT|AUTOINCREMENT|IDENTITY|GENERATED\s+(ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY)\b/.test(upper) ||
  /^(SERIAL|BIGSERIAL|SMALLSERIAL)$/.test(baseType);

  const defaultMatch = rest.match(/\bDEFAULT\s+('(?:[^']|'')*'|"[^"]*"|[A-Za-z0-9_.+-]+(?:\s*\([^)]*\))?)/i);
  const defaultValue = defaultMatch ? defaultMatch[1].trim() : undefined;

  const inlineRef = rest.match(/\bREFERENCES\s+([`"[\]\w.$]+)\s*(\(([^)]*)\))?/i);
  if (inlineRef) {
    const refTable = cleanIdentifier(inlineRef[1]);
    const refColumns = inlineRef[3] ? splitIdentifierList(inlineRef[3]) : [];
    table.foreignKeys.push({
      id: `fk_${table.name}_${name}`.toLowerCase(),
      columns: [name],
      refTable,
      refColumns,
      onDelete: matchAction(rest, 'DELETE'),
      onUpdate: matchAction(rest, 'UPDATE'),
      line,
      inline: true
    });
  }

  if (primaryKey && !table.primaryKeys.some((pk) => eq(pk, name))) table.primaryKeys.push(name);

  return {
    id: `col_${table.name}_${name}`.toLowerCase(),
    name,
    baseType,
    params,
    dataType: params ? `${baseType}${params}` : baseType,
    nullable: primaryKey ? false : notNull ? false : explicitNull ? true : true,
    primaryKey,
    foreignKey: Boolean(inlineRef),
    unique: unique || primaryKey,
    autoIncrement,
    defaultValue,
    line,
    raw: text.trim()
  };
}

function matchAction(text: string, kind: 'DELETE' | 'UPDATE'): string | undefined {
  const m = text.match(new RegExp(`ON\\s+${kind}\\s+(CASCADE|SET\\s+NULL|SET\\s+DEFAULT|RESTRICT|NO\\s+ACTION)`, 'i'));
  return m ? m[1].replace(/\s+/g, ' ').toUpperCase() : undefined;
}

function parseTableConstraint(
text: string,
line: number,
table: TableSchema,
diagnostics: Diagnostic[])
: void {
  const named = text.match(/^\s*CONSTRAINT\s+([`"[\]\w$]+)\s+/i);
  const constraintName = named ? cleanIdentifier(named[1]) : undefined;
  const body = named ? text.slice(named[0].length).trim() : text.trim();
  const upper = body.toUpperCase();

  if (upper.startsWith('PRIMARY KEY')) {
    const cols = body.match(/\(([^)]*)\)/);
    if (!cols) {
      diagnostics.push({
        id: diagId(),
        severity: 'error',
        code: 'INCOMPLETE_PK',
        title: `Incomplete PRIMARY KEY in "${table.name}"`,
        message: 'A table-level PRIMARY KEY must list its columns, e.g. PRIMARY KEY (id).',
        line,
        snippet: body.slice(0, 80)
      });
      return;
    }
    splitIdentifierList(cols[1]).forEach((c) => {
      if (!table.primaryKeys.some((pk) => eq(pk, c))) table.primaryKeys.push(c);
    });
    return;
  }

  if (upper.startsWith('UNIQUE')) {
    const cols = body.match(/\(([^)]*)\)/);
    if (cols) table.uniqueGroups.push(splitIdentifierList(cols[1]));
    return;
  }

  if (upper.startsWith('FOREIGN KEY')) {
    const localCols = body.match(/FOREIGN\s+KEY\s*\(([^)]*)\)/i);
    const ref = body.match(/REFERENCES\s+([`"[\]\w.$]+)\s*(?:\(([^)]*)\))?/i);
    if (!localCols || !ref) {
      diagnostics.push({
        id: diagId(),
        severity: 'error',
        code: 'INCOMPLETE_FK',
        title: `Incomplete FOREIGN KEY in "${table.name}"`,
        message: !localCols ?
        'FOREIGN KEY must list the local column(s), e.g. FOREIGN KEY (department_id).' :
        'FOREIGN KEY is missing its REFERENCES clause.',
        suggestion: 'Write: FOREIGN KEY (local_column) REFERENCES OtherTable(other_column)',
        line,
        snippet: body.slice(0, 90)
      });
      return;
    }
    table.foreignKeys.push({
      id: `fk_${table.name}_${splitIdentifierList(localCols[1]).join('_')}`.toLowerCase(),
      name: constraintName,
      columns: splitIdentifierList(localCols[1]),
      refTable: cleanIdentifier(ref[1]),
      refColumns: ref[2] ? splitIdentifierList(ref[2]) : [],
      onDelete: matchAction(body, 'DELETE'),
      onUpdate: matchAction(body, 'UPDATE'),
      line,
      inline: false
    });
  }
  // CHECK / KEY / INDEX / EXCLUDE are recognised and intentionally ignored for the ER model.
}