import type { JunctionTable, Relationship, TableSchema } from '../../types/schema';

function eq(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a.map((v) => v.toLowerCase()));
  return b.every((v) => s.has(v.toLowerCase()));
}

function isSubset(inner: string[], outer: string[]): boolean {
  const s = new Set(outer.map((v) => v.toLowerCase()));
  return inner.every((v) => s.has(v.toLowerCase()));
}

export const RelationshipAnalyzer = {
  /** Builds one relationship per foreign key constraint that resolves to a known table. */
  detectRelationships(tables: TableSchema[]): Relationship[] {
    const byName = new Map(tables.map((t) => [t.name.toLowerCase(), t]));
    const relationships: Relationship[] = [];

    tables.forEach((table) => {
      table.foreignKeys.forEach((fk, index) => {
        const target = byName.get(fk.refTable.toLowerCase());
        if (!target) return;
        const refColumns = fk.refColumns.length > 0 ? fk.refColumns : target.primaryKeys;
        if (refColumns.length === 0) return;

        const { type, confidence, reason } = RelationshipAnalyzer.inferCardinality(table, fk.columns, target, refColumns);

        relationships.push({
          id: `rel_${table.name}_${fk.columns.join('_')}_${target.name}_${index}`.toLowerCase(),
          sourceTable: table.name,
          sourceColumn: fk.columns.join(', '),
          targetTable: target.name,
          targetColumn: refColumns.join(', '),
          sourceColumns: fk.columns,
          targetColumns: refColumns,
          type,
          confidence,
          selfReferencing: eq(table.name, target.name),
          constraintName: fk.name,
          reason,
          onDelete: fk.onDelete,
          onUpdate: fk.onUpdate
        });
      });
    });

    return relationships;
  },

  inferCardinality(
  source: TableSchema,
  sourceColumns: string[],
  target: TableSchema,
  targetColumns: string[])
  : {type: Relationship['type'];confidence: Relationship['confidence'];reason: string;} {
    const uniqueOnSource =
    source.uniqueGroups.some((g) => sameSet(g, sourceColumns)) ||
    sameSet(source.primaryKeys, sourceColumns) ||
    sourceColumns.length === 1 &&
    source.columns.some((c) => eq(c.name, sourceColumns[0]) && (c.unique || c.primaryKey));

    const nullable = sourceColumns.every((name) => {
      const col = source.columns.find((c) => eq(c.name, name));
      return col ? col.nullable : true;
    });

    if (uniqueOnSource) {
      return {
        type: 'one-to-one',
        confidence: 'high',
        reason: `${sourceColumns.join(', ')} is unique in ${source.name}, so at most one ${source.name} row can point at a given ${target.name} row${
        nullable ? ' (and the link is optional because the column is nullable)' : ''}.`

      };
    }

    const partOfCompositePk =
    source.primaryKeys.length > 1 && isSubset(sourceColumns, source.primaryKeys);

    return {
      type: 'many-to-one',
      confidence: partOfCompositePk ? 'medium' : 'high',
      reason: `The foreign key ${sourceColumns.join(', ')} is not unique in ${source.name}, so many ${source.name} rows may reference the same ${target.name} row${
      nullable ? '; because the column is nullable the relationship is optional' : ''}.`

    };
  },

  detectJunctionTables(tables: TableSchema[]): JunctionTable[] {
    const results: JunctionTable[] = [];
    tables.forEach((table) => {
      const fkColumns = table.foreignKeys.flatMap((fk) => fk.columns);
      if (table.foreignKeys.length < 2) return;

      const pkCoversFks =
      table.primaryKeys.length >= 2 && isSubset(table.primaryKeys, fkColumns);
      const uniqueCoversFks = table.uniqueGroups.some(
        (g) => g.length >= 2 && isSubset(g, fkColumns)
      );
      if (!pkCoversFks && !uniqueCoversFks) return;

      const connects = Array.from(new Set(table.foreignKeys.map((fk) => fk.refTable)));
      if (connects.length < 2) return;

      const extras = table.columns.filter(
        (c) => !fkColumns.some((f) => eq(f, c.name))
      ).length;

      results.push({
        table: table.name,
        connects,
        reason: pkCoversFks ?
        `Its primary key (${table.primaryKeys.join(', ')}) is made up of foreign keys to ${connects.join(
          ' and '
        )}, which is the classic shape of an associative (junction) entity.${
        extras > 0 ? ` It also carries ${extras} descriptive attribute(s) of its own.` : ''}` :

        `A unique constraint spans its foreign keys to ${connects.join(
          ' and '
        )}, so each pairing may only appear once — the shape of an associative entity.`
      });
    });
    return results;
  },

  detectSelfReferences(relationships: Relationship[]): Relationship[] {
    return relationships.filter((r) => r.selfReferencing);
  },

  /** Derived many-to-many pairs implied by junction tables (not real FK edges). */
  derivedManyToMany(junctions: JunctionTable[]): {a: string;b: string;via: string;}[] {
    const out: {a: string;b: string;via: string;}[] = [];
    junctions.forEach((j) => {
      for (let i = 0; i < j.connects.length; i += 1) {
        for (let k = i + 1; k < j.connects.length; k += 1) {
          out.push({ a: j.connects[i], b: j.connects[k], via: j.table });
        }
      }
    });
    return out;
  }
};