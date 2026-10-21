export interface Slice {
  text: string;
  start: number;
}

const QUOTES = ["'", '"', '`'];

/**
 * Removes -- , # and block comments while preserving character offsets so that
 * line numbers reported by the parser still match the user's original SQL.
 */
export function stripComments(sql: string): string {
  let out = '';
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    const next = sql[i + 1];

    if (c === '-' && next === '-' || c === '#') {
      while (i < n && sql[i] !== '\n') {
        out += ' ';
        i += 1;
      }
      continue;
    }

    if (c === '/' && next === '*') {
      out += '  ';
      i += 2;
      while (i < n && !(sql[i] === '*' && sql[i + 1] === '/')) {
        out += sql[i] === '\n' ? '\n' : ' ';
        i += 1;
      }
      out += i < n ? '  ' : '';
      i += 2;
      continue;
    }

    if (QUOTES.includes(c)) {
      const quote = c;
      out += c;
      i += 1;
      while (i < n) {
        if (sql[i] === '\\' && quote === "'") {
          out += sql[i] + (sql[i + 1] ?? '');
          i += 2;
          continue;
        }
        out += sql[i];
        const closed = sql[i] === quote;
        i += 1;
        if (closed) break;
      }
      continue;
    }

    out += c;
    i += 1;
  }
  return out;
}

/** Splits SQL text into statements on top-level semicolons, keeping offsets. */
export function splitStatements(sql: string): Slice[] {
  const result: Slice[] = [];
  let depth = 0;
  let start = 0;
  let i = 0;
  const n = sql.length;
  while (i < n) {
    const c = sql[i];
    if (QUOTES.includes(c)) {
      i = skipQuoted(sql, i);
      continue;
    }
    if (c === '(') depth += 1;else
    if (c === ')') depth = Math.max(0, depth - 1);else
    if (c === ';' && depth === 0) {
      const text = sql.slice(start, i);
      if (text.trim()) result.push({ text, start });
      start = i + 1;
    }
    i += 1;
  }
  const tail = sql.slice(start);
  if (tail.trim()) result.push({ text: tail, start });
  return result;
}

/** Splits a parenthesised body on top-level commas, keeping offsets. */
export function splitTopLevel(body: string, offset: number, separator = ','): Slice[] {
  const result: Slice[] = [];
  let depth = 0;
  let start = 0;
  let i = 0;
  const n = body.length;
  while (i < n) {
    const c = body[i];
    if (QUOTES.includes(c)) {
      i = skipQuoted(body, i);
      continue;
    }
    if (c === '(') depth += 1;else
    if (c === ')') depth = Math.max(0, depth - 1);else
    if (c === separator && depth === 0) {
      result.push({ text: body.slice(start, i), start: offset + start });
      start = i + 1;
    }
    i += 1;
  }
  if (body.slice(start).trim()) result.push({ text: body.slice(start), start: offset + start });
  return result;
}

function skipQuoted(text: string, index: number): number {
  const quote = text[index];
  let i = index + 1;
  while (i < text.length) {
    if (text[i] === '\\' && quote === "'") {
      i += 2;
      continue;
    }
    if (text[i] === quote) return i + 1;
    i += 1;
  }
  return i;
}

/** Index of the closing paren matching the opening paren at `open`. -1 when unbalanced. */
export function matchParen(text: string, open: number): number {
  let depth = 0;
  let i = open;
  while (i < text.length) {
    const c = text[i];
    if (QUOTES.includes(c)) {
      i = skipQuoted(text, i);
      continue;
    }
    if (c === '(') depth += 1;else
    if (c === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
    i += 1;
  }
  return -1;
}

export function parenBalance(sql: string): number {
  let depth = 0;
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    if (QUOTES.includes(c)) {
      i = skipQuoted(sql, i);
      continue;
    }
    if (c === '(') depth += 1;
    if (c === ')') depth -= 1;
    i += 1;
  }
  return depth;
}

export function lineAt(sql: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < sql.length; i += 1) {
    if (sql[i] === '\n') line += 1;
  }
  return line;
}

/** Normalizes `schema`.`Table`, "Table", [Table] → Table */
export function cleanIdentifier(raw: string): string {
  const trimmed = raw.trim().replace(/[;,]+$/, '');
  const parts = trimmed.split('.');
  const last = parts[parts.length - 1] ?? trimmed;
  return last.replace(/^[`"[\s]+/, '').replace(/[`"\]\s]+$/, '');
}

export function splitIdentifierList(raw: string): string[] {
  return raw.
  split(',').
  map((part) => cleanIdentifier(part)).
  filter(Boolean);
}