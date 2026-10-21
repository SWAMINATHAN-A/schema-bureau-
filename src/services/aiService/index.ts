import type { ParsedSchema } from '../../types/schema';
import {
  cardinalityLabel,
  explainPrimaryKey,
  explainTable,
  generateSchemaSummary } from
'../explanationEngine';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source: 'local' | 'remote';
  at: number;
}

export interface AIContext {
  schema: ParsedSchema | null;
}

export interface AIProvider {
  readonly name: string;
  readonly configured: boolean;
  ask(question: string, context: AIContext): Promise<{content: string;source: 'local' | 'remote';}>;
}

/**
 * Rule-based provider. Produces genuine answers from the parsed schema without
 * any network access, and is the permanent fallback when no API provider is set.
 */
export class LocalExplanationProvider implements AIProvider {
  readonly name = 'SCHEMA BUREAU Local Reasoning';
  readonly configured = true;

  async ask(question: string, context: AIContext): Promise<{content: string;source: 'local';}> {
    await delay(180);
    return { content: answerLocally(question, context.schema), source: 'local' };
  }
}

/**
 * Remote provider scaffold. Reads its key from the build environment only —
 * never from user input — and is inert until an endpoint is configured.
 *
 * Configure by setting one of:
 *   VITE_OPENAI_PROXY_URL | VITE_ANTHROPIC_PROXY_URL | VITE_GEMINI_PROXY_URL
 * These must point at YOUR backend proxy. Keys must never live in the frontend.
 */
export class RemoteAIProvider implements AIProvider {
  readonly name = 'Groq · GPT-OSS 120B';
  readonly endpoint = '/api/groq';

  get configured(): boolean {
    return true;
  }

  async ask(question: string, context: AIContext): Promise<{content: string;source: 'remote';}> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        schema: context.schema ? {
          tables: context.schema.tables,
          relationships: context.schema.relationships,
          junctionTables: context.schema.junctionTables,
          diagnostics: context.schema.diagnostics,
          insights: context.schema.insights,
          stats: context.schema.stats
        } : null
      })
    });

    const data = await response.json().catch(() => ({})) as {content?: string; error?: string;};
    if (!response.ok) throw new Error(data.error ?? `Groq provider responded with ${response.status}`);
    return { content: data.content ?? 'Groq returned an empty response.', source: 'remote' };
  }
}

export class AIService {
  private local = new LocalExplanationProvider();
  private remote = new RemoteAIProvider();

  get remoteConfigured(): boolean {
    return this.remote.configured;
  }

  get providerName(): string {
    return this.remote.name;
  }

  async ask(question: string, context: AIContext): Promise<{content: string;source: 'local' | 'remote';}> {
    try {
      return await this.remote.ask(question, context);
    } catch (error) {
      const fallback = await this.local.ask(question, context);
      return {
        content: `${fallback.content}\n\n(Groq was unavailable, so SCHEMA BUREAU used its local schema reasoning fallback.)`,
        source: 'local'
      };
    }
  }
}

export const aiService = new AIService();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ---------------------------------------------------------------- */
/* Rule-based reasoning over the parsed schema                       */
/* ---------------------------------------------------------------- */

function answerLocally(question: string, schema: ParsedSchema | null): string {
  const q = question.toLowerCase().trim();

  if (!schema || schema.tables.length === 0) {
    if (/composite/.test(q)) return CONCEPTS.compositeKey;
    if (/normal/.test(q)) return CONCEPTS.normalization;
    if (/foreign key/.test(q)) return CONCEPTS.foreignKey;
    if (/primary key/.test(q)) return CONCEPTS.primaryKey;
    return 'Generate a diagram first and I can answer against your actual schema. In the meantime, ask me about primary keys, foreign keys, composite keys, cardinality, junction tables, or normalization.';
  }

  const named = schema.tables.find((t) => q.includes(t.name.toLowerCase()));

  if (/beginner|explain (this )?schema|what does this|overview|summar/.test(q)) {
    const lines = [
    generateSchemaSummary(schema),
    '',
    'Entity by entity:',
    ...schema.tables.map(
      (t) =>
      `• ${t.name} — ${t.columns.length} attributes${
      t.primaryKeys.length ? `, identified by ${t.primaryKeys.join(' + ')}` : ', with no identifier'}.`

    )];

    if (schema.relationships.length > 0) {
      lines.push('', 'How they connect:');
      schema.relationships.forEach((r) => lines.push(`• ${cardinalityLabel(r)} (via ${r.sourceTable}.${r.sourceColumn}).`));
    }
    return lines.join('\n');
  }

  if (/issue|problem|wrong|smell|improve|review|health/.test(q)) {
    const errs = schema.diagnostics.filter((d) => d.severity === 'error');
    const warns = schema.diagnostics.filter((d) => d.severity === 'warning');
    const lines: string[] = [];
    lines.push(
      errs.length === 0 ?
      'No blocking errors were found in this schema.' :
      `${errs.length} blocking issue(s):`
    );
    errs.forEach((e) => lines.push(`• ${e.title} — ${e.message}`));
    if (warns.length) {
      lines.push('', `${warns.length} warning(s):`);
      warns.forEach((w) => lines.push(`• ${w.title} — ${w.message}`));
    }
    if (schema.insights.length) {
      lines.push('', 'Observations:');
      schema.insights.slice(0, 5).forEach((i) => lines.push(`• ${i.title}`));
    }
    return lines.join('\n');
  }

  if (/many.to.one|why is this relationship|cardinalit/.test(q)) {
    if (schema.relationships.length === 0)
    return 'This schema has no foreign keys yet, so there are no relationships to reason about. Add a REFERENCES clause and regenerate.';
    const rel =
    schema.relationships.find((r) => q.includes(r.sourceTable.toLowerCase()) && q.includes(r.targetTable.toLowerCase())) ??
    schema.relationships[0];
    return `${cardinalityLabel(rel)}.\n\n${rel.reason}\n\nConfidence: ${rel.confidence}. Cardinality is inferred from uniqueness and nullability of ${rel.sourceTable}.${rel.sourceColumn}; SQL alone cannot express every business rule, so treat the "many" side as an upper bound rather than a certainty.`;
  }

  if (/junction|associative|many.to.many|bridge/.test(q)) {
    if (schema.junctionTables.length === 0)
    return `${CONCEPTS.junction}\n\nNo table in your current schema matches that shape — none combines two or more foreign keys into a composite primary key or unique constraint.`;
    return [
    CONCEPTS.junction,
    '',
    'In your schema:',
    ...schema.junctionTables.map((j) => `• ${j.table} → ${j.reason}`)].
    join('\n');
  }

  if (/composite/.test(q)) {
    const composite = schema.tables.filter((t) => t.primaryKeys.length > 1);
    return [
    CONCEPTS.compositeKey,
    '',
    composite.length ?
    `In your schema: ${composite.map((t) => `${t.name} (${t.primaryKeys.join(' + ')})`).join(', ')}.` :
    'No table in your current schema uses a composite key.'].
    join('\n');
  }

  if (/primary key/.test(q)) {
    if (named) return explainPrimaryKey(named);
    return [
    CONCEPTS.primaryKey,
    '',
    'In your schema:',
    ...schema.tables.map((t) => `• ${explainPrimaryKey(t)}`)].
    join('\n');
  }

  if (/foreign key/.test(q)) {
    return [
    CONCEPTS.foreignKey,
    '',
    schema.relationships.length ?
    schema.relationships.map((r) => `• ${r.sourceTable}.${r.sourceColumn} → ${r.targetTable}.${r.targetColumn}`).join('\n') :
    'Your schema currently declares no foreign keys.'].
    join('\n');
  }

  if (/normal/.test(q)) {
    const wide = schema.tables.filter((t) => t.columns.length > 10);
    return [
    CONCEPTS.normalization,
    '',
    wide.length ?
    `Worth a second look in your schema: ${wide.map((t) => `${t.name} (${t.columns.length} attributes)`).join(', ')}.` :
    'Nothing in your schema looks obviously denormalized from the structure alone — though only the data can confirm that.'].
    join('\n');
  }

  if (/self.referen|hierarch|recursive/.test(q)) {
    const selfs = schema.relationships.filter((r) => r.selfReferencing);
    return selfs.length ?
    selfs.map((r) => `${r.sourceTable}.${r.sourceColumn} references ${r.targetTable}.${r.targetColumn} — a self-referencing relationship, typically a hierarchy such as parent/child or manager/report.`).join('\n') :
    'No self-referencing relationships were detected. They appear when a table declares a foreign key pointing back at itself, such as Employee.manager_id → Employee.employee_id.';
  }

  if (named) {
    return [
    explainTable(named),
    '',
    'Attributes:',
    ...named.columns.map(
      (c) =>
      `• ${c.name} ${c.dataType}${c.primaryKey ? ' — primary key' : ''}${c.foreignKey ? ' — foreign key' : ''}${
      c.unique && !c.primaryKey ? ' — unique' : ''}${
      c.nullable ? '' : ' — required'}`
    )].
    join('\n');
  }

  return [
  "I answer from the schema you generated, using rule-based reasoning over the parsed model.",
  '',
  generateSchemaSummary(schema),
  '',
  'Try asking: "Explain this schema like I\'m a beginner", "Find possible schema issues", "Why is this relationship many-to-one?", "What is a composite key?", or name any table to get its breakdown.'].
  join('\n');
}

const CONCEPTS = {
  primaryKey:
  'A primary key is the attribute (or combination of attributes) that uniquely identifies each row of a table. It must be unique and non-null, and it is what other tables point at when they need to reference this entity.',
  foreignKey:
  'A foreign key is a column whose values must already exist in another table. It enforces referential integrity and is the SQL mechanism that produces a relationship line in an ER diagram.',
  compositeKey:
  'A composite key is a primary key made of two or more columns. No single column identifies a row on its own — only the combination does. Composite keys most commonly appear on associative tables that record a pairing, such as (student_id, course_id).',
  junction:
  'A junction (or associative) table resolves a many-to-many relationship. Relational databases cannot express many-to-many directly, so a third table is introduced holding a foreign key to each side, usually with those foreign keys forming its composite primary key.',
  normalization:
  'Normalization organizes columns and tables to reduce redundancy. 1NF requires atomic values, 2NF removes partial dependencies on part of a composite key, and 3NF removes transitive dependencies where a non-key attribute depends on another non-key attribute. The practical goal is that every fact is stored exactly once.'
};