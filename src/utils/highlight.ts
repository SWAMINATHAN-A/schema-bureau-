const KEYWORDS = new Set([
'CREATE', 'TABLE', 'IF', 'NOT', 'EXISTS', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'NULL', 'DEFAULT',
'CONSTRAINT', 'CHECK', 'INDEX', 'ON', 'DELETE', 'UPDATE', 'CASCADE', 'SET', 'RESTRICT', 'NO', 'ACTION', 'AUTO_INCREMENT',
'AUTOINCREMENT', 'IDENTITY', 'GENERATED', 'ALWAYS', 'AS', 'TEMPORARY', 'TEMP', 'ALTER', 'ADD', 'DROP', 'SELECT', 'FROM',
'WHERE', 'INSERT', 'INTO', 'VALUES', 'AND', 'OR', 'TRUE', 'FALSE', 'CURRENT_TIMESTAMP', 'CURRENT_DATE', 'UNSIGNED', 'ENGINE']
);

const TYPES = new Set([
'INT', 'INTEGER', 'TINYINT', 'SMALLINT', 'MEDIUMINT', 'BIGINT', 'SERIAL', 'BIGSERIAL', 'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL',
'DOUBLE', 'PRECISION', 'MONEY', 'BOOL', 'BOOLEAN', 'CHAR', 'NCHAR', 'VARCHAR', 'NVARCHAR', 'CHARACTER', 'VARYING', 'TEXT',
'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT', 'BLOB', 'BYTEA', 'JSON', 'JSONB', 'UUID', 'DATE', 'TIME', 'DATETIME', 'TIMESTAMP',
'TIMESTAMPTZ', 'YEAR', 'INTERVAL', 'ENUM']
);

function escapeHtml(value: string): string {
  return value.replace(/[&<>]/g, (c) => c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;');
}

/** Produces highlighted HTML that lines up 1:1 with the raw text in the textarea. */
export function highlightSql(sql: string): string {
  const tokenRe = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^']|'')*')|(`[^`]*`|"[^"]*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([(),;])/g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(sql)) !== null) {
    result += escapeHtml(sql.slice(lastIndex, match.index));
    const [full, comment, str, quoted, num, word, punc] = match;
    if (comment) result += `<span class="tok-com">${escapeHtml(full)}</span>`;else
    if (str) result += `<span class="tok-str">${escapeHtml(full)}</span>`;else
    if (quoted) result += `<span class="tok-str">${escapeHtml(full)}</span>`;else
    if (num) result += `<span class="tok-num">${escapeHtml(full)}</span>`;else
    if (word) {
      const upper = word.toUpperCase();
      if (KEYWORDS.has(upper)) result += `<span class="tok-kw">${escapeHtml(full)}</span>`;else
      if (TYPES.has(upper)) result += `<span class="tok-type">${escapeHtml(full)}</span>`;else
      result += escapeHtml(full);
    } else if (punc) result += `<span class="tok-punc">${escapeHtml(full)}</span>`;
    lastIndex = match.index + full.length;
  }
  result += escapeHtml(sql.slice(lastIndex));
  return result;
}