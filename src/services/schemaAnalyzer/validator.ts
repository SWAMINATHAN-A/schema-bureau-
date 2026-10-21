import type { Diagnostic, TableSchema } from '../../types/schema';

let counter = 0;
function id(): string {
  counter += 1;
  return `val_${counter}`;
}

function eq(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export const SchemaValidator = {
  validateEmpty(sql: string): Diagnostic | null {
    if (sql.trim().length > 0) return null;
    return {
      id: id(),
      severity: 'error',
      code: 'EMPTY_INPUT',
      title: 'No SQL to analyze',
      message: 'The editor is empty, so there is nothing to convert into an ER model.',
      suggestion: 'Paste a CREATE TABLE schema or load one of the example schemas.'
    };
  },

  validateTables(tables: TableSchema[]): Diagnostic[] {
    const out: Diagnostic[] = [];
    const seen = new Map<string, TableSchema>();
    tables.forEach((table) => {
      const key = table.name.toLowerCase();
      const prior = seen.get(key);
      if (prior) {
        out.push({
          id: id(),
          severity: 'error',
          code: 'DUPLICATE_TABLE',
          title: `Duplicate table "${table.name}"`,
          message: `"${table.name}" is defined more than once (first at line ${prior.line}, again at line ${table.line}). A schema cannot contain two entities with the same name.`,
          suggestion: 'Rename or remove one of the definitions.',
          line: table.line
        });
      } else {
        seen.set(key, table);
      }
    });
    return out;
  },

  validateColumns(tables: TableSchema[]): Diagnostic[] {
    const out: Diagnostic[] = [];
    tables.forEach((table) => {
      const seen = new Set<string>();
      table.columns.forEach((column) => {
        const key = column.name.toLowerCase();
        if (seen.has(key)) {
          out.push({
            id: id(),
            severity: 'error',
            code: 'DUPLICATE_COLUMN',
            title: `Duplicate column "${table.name}.${column.name}"`,
            message: `The column "${column.name}" is declared twice inside "${table.name}".`,
            suggestion: 'Remove or rename the repeated column.',
            line: column.line
          });
        }
        seen.add(key);
      });

      table.primaryKeys.forEach((pk) => {
        if (!table.columns.some((c) => eq(c.name, pk))) {
          out.push({
            id: id(),
            severity: 'error',
            code: 'PK_UNKNOWN_COLUMN',
            title: `Primary key column "${pk}" does not exist`,
            message: `"${table.name}" declares PRIMARY KEY (${pk}) but has no column named "${pk}".`,
            suggestion: `Add the column, or point the primary key at an existing column of ${table.name}.`,
            line: table.line
          });
        }
      });

      table.uniqueGroups.forEach((group) => {
        group.forEach((name) => {
          if (!table.columns.some((c) => eq(c.name, name))) {
            out.push({
              id: id(),
              severity: 'warning',
              code: 'UNIQUE_UNKNOWN_COLUMN',
              title: `UNIQUE references unknown column "${name}"`,
              message: `"${table.name}" declares a UNIQUE constraint on "${name}", which is not one of its columns.`,
              line: table.line
            });
          }
        });
      });
    });
    return out;
  },

  validateForeignKeys(tables: TableSchema[]): Diagnostic[] {
    const out: Diagnostic[] = [];
    const byName = new Map(tables.map((t) => [t.name.toLowerCase(), t]));

    tables.forEach((table) => {
      table.foreignKeys.forEach((fk) => {
        fk.columns.forEach((col) => {
          if (!table.columns.some((c) => eq(c.name, col))) {
            out.push({
              id: id(),
              severity: 'error',
              code: 'FK_UNKNOWN_LOCAL_COLUMN',
              title: 'Foreign key column not found',
              message: `${table.name}.${col} is used in a FOREIGN KEY but "${table.name}" has no such column.`,
              suggestion: `Declare "${col}" in ${table.name}, or correct the constraint.`,
              line: fk.line
            });
          }
        });

        const target = byName.get(fk.refTable.toLowerCase());
        if (!target) {
          out.push({
            id: id(),
            severity: 'error',
            code: 'FK_MISSING_TABLE',
            title: 'Foreign key reference failed',
            message: `${table.name}.${fk.columns.join(', ')} references ${fk.refTable}.${
            fk.refColumns.join(', ') || '?'} — the referenced table does not exist in the current schema.`,

            suggestion: `Create the "${fk.refTable}" table or correct the table name in the REFERENCES clause.`,
            line: fk.line,
            snippet: `REFERENCES ${fk.refTable}(${fk.refColumns.join(', ')})`
          });
          return;
        }

        if (fk.refColumns.length === 0) {
          if (target.primaryKeys.length === 0) {
            out.push({
              id: id(),
              severity: 'error',
              code: 'FK_NO_IMPLICIT_TARGET',
              title: 'Foreign key target is ambiguous',
              message: `${table.name}.${fk.columns.join(', ')} references ${fk.refTable} without naming a column, and "${fk.refTable}" has no primary key to fall back on.`,
              suggestion: `Add a primary key to ${fk.refTable} or write REFERENCES ${fk.refTable}(column).`,
              line: fk.line
            });
          } else {
            out.push({
              id: id(),
              severity: 'warning',
              code: 'FK_IMPLICIT_TARGET',
              title: 'Implicit foreign key target',
              message: `${table.name}.${fk.columns.join(', ')} references ${fk.refTable} without naming a column. SCHEMA BUREAU assumes the primary key ${target.primaryKeys.join(', ')}.`,
              line: fk.line
            });
          }
        } else {
          fk.refColumns.forEach((refCol) => {
            if (!target.columns.some((c) => eq(c.name, refCol))) {
              out.push({
                id: id(),
                severity: 'error',
                code: 'FK_MISSING_COLUMN',
                title: 'Foreign key reference failed',
                message: `${table.name}.${fk.columns.join(', ')} references ${fk.refTable}.${refCol} — the table "${fk.refTable}" exists but has no column named "${refCol}".`,
                suggestion: `Available columns on ${fk.refTable}: ${target.columns.map((c) => c.name).join(', ') || 'none'}.`,
                line: fk.line
              });
            }
          });

          if (fk.refColumns.length !== fk.columns.length) {
            out.push({
              id: id(),
              severity: 'error',
              code: 'FK_ARITY_MISMATCH',
              title: 'Foreign key column count mismatch',
              message: `${table.name} maps ${fk.columns.length} column(s) onto ${fk.refColumns.length} column(s) of ${fk.refTable}. A composite foreign key must reference the same number of columns.`,
              line: fk.line
            });
          }

          const targetsUnique =
          target.primaryKeys.length > 0 &&
          sameSet(target.primaryKeys, fk.refColumns) === false &&
          target.uniqueGroups.every((g) => sameSet(g, fk.refColumns) === false);
          if (targetsUnique) {
            out.push({
              id: id(),
              severity: 'warning',
              code: 'FK_NON_UNIQUE_TARGET',
              title: 'Foreign key targets a non-unique column',
              message: `${table.name}.${fk.columns.join(', ')} references ${fk.refTable}(${fk.refColumns.join(
                ', '
              )}), which is neither the primary key nor a unique constraint of ${fk.refTable}.`,
              suggestion: 'Most engines require the referenced columns to be uniquely indexed.',
              line: fk.line
            });
          }
        }
      });
    });
    return out;
  },

  validate(tables: TableSchema[], sql: string): Diagnostic[] {
    const empty = SchemaValidator.validateEmpty(sql);
    if (empty) return [empty];
    return [
    ...SchemaValidator.validateTables(tables),
    ...SchemaValidator.validateColumns(tables),
    ...SchemaValidator.validateForeignKeys(tables)];

  }
};

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a.map((v) => v.toLowerCase()));
  return b.every((v) => s.has(v.toLowerCase()));
}