import { matchParen, splitStatements, splitTopLevel, stripComments } from '../services/sqlParser/tokenizer';

const KEYWORDS = [
'CREATE TABLE',
'PRIMARY KEY',
'FOREIGN KEY',
'REFERENCES',
'NOT NULL',
'UNIQUE',
'DEFAULT',
'AUTO_INCREMENT',
'ON DELETE',
'ON UPDATE',
'CONSTRAINT',
'CHECK',
'IF NOT EXISTS'];


/** Re-indents CREATE TABLE statements: one definition per line, keywords upper-cased. */
export function formatSql(input: string): string {
  const clean = stripComments(input);
  const statements = splitStatements(clean);
  if (statements.length === 0) return input.trim();

  const out = statements.
  map(({ text }) => {
    const trimmed = text.trim().replace(/\s+/g, ' ');
    const open = trimmed.indexOf('(');
    if (!/^CREATE\s/i.test(trimmed) || open === -1) return `${upperKeywords(trimmed)};`;
    const close = matchParen(trimmed, open);
    if (close === -1) return `${upperKeywords(trimmed)};`;

    const head = upperKeywords(trimmed.slice(0, open).trim());
    const body = trimmed.slice(open + 1, close);
    const tail = trimmed.slice(close + 1).trim();
    const parts = splitTopLevel(body, 0).map((p) => upperKeywords(p.text.trim()));
    return `${head} (\n${parts.map((p) => `    ${p}`).join(',\n')}\n)${tail ? ` ${upperKeywords(tail)}` : ''};`;
  }).
  join('\n\n');

  return out;
}

function upperKeywords(text: string): string {
  let result = text;
  KEYWORDS.forEach((kw) => {
    result = result.replace(new RegExp(`\\b${kw.replace(/ /g, '\\s+')}\\b`, 'gi'), kw);
  });
  return result.replace(/\s+,/g, ',');
}