import type { Diagnostic, Insight, JunctionTable, Relationship, TableSchema } from '../../types/schema';

let counter = 0;
function id(): string {
  counter += 1;
  return `ins_${counter}`;
}

export function generateInsights(
tables: TableSchema[],
relationships: Relationship[],
junctions: JunctionTable[],
diagnostics: Diagnostic[])
: Insight[] {
  const insights: Insight[] = [];
  if (tables.length === 0) return insights;

  diagnostics.
  filter((d) => d.severity === 'error').
  slice(0, 6).
  forEach((d) => {
    insights.push({ id: id(), kind: 'error', title: d.title, detail: d.message });
  });

  const noPk = tables.filter((t) => t.primaryKeys.length === 0);
  if (noPk.length === 0) {
    insights.push({
      id: id(),
      kind: 'success',
      title: 'Every table declares a primary key',
      detail: `All ${tables.length} detected table(s) have a primary key, so each entity has a reliable identity.`
    });
  } else {
    noPk.forEach((t) => {
      insights.push({
        id: id(),
        kind: 'warning',
        title: `${t.name} does not appear to contain a primary key`,
        detail: `Without a primary key, rows in ${t.name} cannot be uniquely identified and cannot be safely referenced by other tables.`,
        tables: [t.name]
      });
    });
  }

  junctions.forEach((j) => {
    insights.push({
      id: id(),
      kind: 'insight',
      title: `${j.table} may represent a junction table between ${j.connects.join(' and ')}`,
      detail: `${j.reason} This is an inference drawn from the constraint shape, not a fact stated by the SQL.`,
      tables: [j.table, ...j.connects]
    });
  });

  const selfRefs = relationships.filter((r) => r.selfReferencing);
  selfRefs.forEach((r) => {
    insights.push({
      id: id(),
      kind: 'insight',
      title: `${r.sourceTable} references itself through ${r.sourceColumn}`,
      detail: `A self-referencing relationship usually models a hierarchy — for example a row in ${r.sourceTable} pointing at its parent row via ${r.sourceColumn}.`,
      tables: [r.sourceTable]
    });
  });

  const isolated = tables.filter(
    (t) =>
    !relationships.some(
      (r) => r.sourceTable.toLowerCase() === t.name.toLowerCase() || r.targetTable.toLowerCase() === t.name.toLowerCase()
    )
  );
  if (isolated.length > 0 && tables.length > 1) {
    insights.push({
      id: id(),
      kind: 'warning',
      title: `${isolated.length} table(s) are not connected to anything`,
      detail: `${isolated.
      map((t) => t.name).
      join(', ')} declare no foreign keys and are not referenced by any table, so they float free in the ER model.`,
      tables: isolated.map((t) => t.name)
    });
  }

  if (relationships.length > 0) {
    insights.push({
      id: id(),
      kind: 'suggestion',
      title: 'Consider indexing foreign key columns in production databases',
      detail: `Join and cascade performance depends on indexes over ${relationships.
      slice(0, 3).
      map((r) => `${r.sourceTable}.${r.sourceColumn}`).
      join(', ')}${relationships.length > 3 ? ', …' : ''}. Some engines create these automatically; others do not.`
    });
  }

  const nullableFks = relationships.filter((r) =>
  r.sourceColumns.every((name) => {
    const table = tables.find((t) => t.name.toLowerCase() === r.sourceTable.toLowerCase());
    const col = table?.columns.find((c) => c.name.toLowerCase() === name.toLowerCase());
    return col ? col.nullable : false;
  })
  );
  if (nullableFks.length > 0) {
    insights.push({
      id: id(),
      kind: 'insight',
      title: `${nullableFks.length} relationship(s) are optional`,
      detail: `${nullableFks.
      slice(0, 3).
      map((r) => `${r.sourceTable}.${r.sourceColumn}`).
      join(
        ', '
      )} allow NULL, so participation on that side is partial — a row can exist without the related row.`
    });
  }

  const wideTables = tables.filter((t) => t.columns.length > 12);
  wideTables.forEach((t) => {
    insights.push({
      id: id(),
      kind: 'suggestion',
      title: `${t.name} carries ${t.columns.length} attributes`,
      detail: `Wide entities are often a sign that more than one concept is being stored together. Consider whether ${t.name} could be decomposed during normalization.`,
      tables: [t.name]
    });
  });

  const noText = tables.filter((t) => t.columns.length === 1);
  noText.forEach((t) => {
    insights.push({
      id: id(),
      kind: 'insight',
      title: `${t.name} has a single attribute`,
      detail: `Entities with only one attribute are usually lookup tables or the result of an incomplete definition.`,
      tables: [t.name]
    });
  });

  return insights;
}