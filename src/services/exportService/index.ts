import type { ParsedSchema } from '../../types/schema';
import { cardinalityLabel, generateSchemaSummary } from '../explanationEngine';
import { NODE_WIDTH, ROW_HEIGHT, HEADER_HEIGHT } from '../diagram/layout';
import { buildChenLayout, diamondBoundary, entityBoundary } from '../diagram/chenLayout';

export interface DiagramGeometry {
  nodes: {id: string;x: number;y: number;width: number;height: number;}[];
  edges: {id: string;source: string;target: string;label: string;}[];
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeName(name: string): string {
  return name.replace(/[^\w-]+/g, '_').replace(/^_|_$/g, '') || 'schema';
}

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) =>
  c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c === "'" ? '&apos;' : '&quot;'
  );
}

export const ExportService = {
  exportJson(schema: ParsedSchema, name: string): void {
    const payload = {
      name,
      generatedBy: 'SCHEMA BUREAU Relational Systems Lab',
      generatedAt: new Date().toISOString(),
      stats: schema.stats,
      valid: schema.valid,
      tables: schema.tables,
      relationships: schema.relationships,
      junctionTables: schema.junctionTables,
      diagnostics: schema.diagnostics,
      insights: schema.insights
    };
    download(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `${safeName(name)}.json`);
  },

  exportSql(schema: ParsedSchema, name: string): void {
    const header = `-- ${name}\n-- Exported from SCHEMA BUREAU on ${new Date().toISOString()}\n-- ${schema.stats.tables} tables · ${schema.stats.relationships} relationships\n\n`;
    download(new Blob([header + schema.sql], { type: 'text/plain' }), `${safeName(name)}.sql`);
  },

  buildSvg(schema: ParsedSchema, geometry: DiagramGeometry, theme: 'dark' | 'light'): string {
    const palette =
    theme === 'dark' ?
    { bg: '#08090b', surface: '#0d0f12', header: '#121519', line: '#2a2f36', text: '#e6e9ee', muted: '#9aa4b1', accent: '#2ec4c8' } :
    { bg: '#f7f7f5', surface: '#ffffff', header: '#f2f2f0', line: '#cfcfc9', text: '#16181c', muted: '#5c6371', accent: '#0e8f93' };

    const pad = 48;
    const minX = Math.min(...geometry.nodes.map((n) => n.x));
    const minY = Math.min(...geometry.nodes.map((n) => n.y));
    const maxX = Math.max(...geometry.nodes.map((n) => n.x + n.width));
    const maxY = Math.max(...geometry.nodes.map((n) => n.y + n.height));
    const width = maxX - minX + pad * 2;
    const height = maxY - minY + pad * 2;
    const dx = pad - minX;
    const dy = pad - minY;

    const nodeById = new Map(geometry.nodes.map((n) => [n.id, n]));

    const edgeSvg = geometry.edges.
    map((edge) => {
      const a = nodeById.get(edge.source);
      const b = nodeById.get(edge.target);
      if (!a || !b) return '';
      if (a.id === b.id) {
        const x = a.x + a.width + dx;
        const y = a.y + a.height / 2 + dy;
        return `<path d="M ${x} ${y} C ${x + 60} ${y - 40}, ${x + 60} ${y + 40}, ${x} ${y + 12}" fill="none" stroke="${palette.line}" stroke-width="1.4"/><text x="${x + 48}" y="${y}" fill="${palette.muted}" font-size="10" font-family="monospace">${escapeXml(edge.label)}</text>`;
      }
      const x1 = a.x + a.width / 2 + dx;
      const y1 = a.y + a.height / 2 + dy;
      const x2 = b.x + b.width / 2 + dx;
      const y2 = b.y + b.height / 2 + dy;
      const mx = (x1 + x2) / 2;
      return `<path d="M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}" fill="none" stroke="${palette.line}" stroke-width="1.4"/><text x="${mx}" y="${(y1 + y2) / 2 - 5}" fill="${palette.muted}" font-size="10" font-family="monospace" text-anchor="middle">${escapeXml(edge.label)}</text>`;
    }).
    join('');

    const nodeSvg = schema.tables.
    map((table) => {
      const n = nodeById.get(table.name);
      if (!n) return '';
      const x = n.x + dx;
      const y = n.y + dy;
      const rows = table.columns.
      map((col, i) => {
        const ry = y + HEADER_HEIGHT + i * ROW_HEIGHT + 16;
        const badge = col.primaryKey ? 'PK' : col.foreignKey ? 'FK' : '';
        return `<text x="${x + 12}" y="${ry}" fill="${palette.accent}" font-size="9" font-family="monospace">${badge}</text><text x="${x + 38}" y="${ry}" fill="${palette.text}" font-size="11" font-family="monospace">${escapeXml(col.name)}</text><text x="${x + n.width - 12}" y="${ry}" fill="${palette.muted}" font-size="10" font-family="monospace" text-anchor="end">${escapeXml(col.dataType)}</text>`;
      }).
      join('');
      return `<g><rect x="${x}" y="${y}" width="${n.width}" height="${n.height}" rx="6" fill="${palette.surface}" stroke="${palette.line}"/><rect x="${x}" y="${y}" width="${n.width}" height="${HEADER_HEIGHT}" rx="6" fill="${palette.header}"/><rect x="${x}" y="${y + HEADER_HEIGHT - 6}" width="${n.width}" height="6" fill="${palette.header}"/><line x1="${x}" y1="${y + HEADER_HEIGHT}" x2="${x + n.width}" y2="${y + HEADER_HEIGHT}" stroke="${palette.line}"/><text x="${x + 12}" y="${y + 25}" fill="${palette.text}" font-size="12" font-weight="600" font-family="sans-serif">${escapeXml(table.name.toUpperCase())}</text>${rows}</g>`;
    }).
    join('');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${palette.bg}"/>${edgeSvg}${nodeSvg}</svg>`;
  },

  buildChenSvg(schema: ParsedSchema, theme: 'dark' | 'light'): string {
    const palette = theme === 'dark'
      ? { bg:'#0a0b0d', surface:'#111317', line:'#50545b', text:'#f0eee7', muted:'#a5a79f', accent:'#ff321d', grid:'#d8d5ca' }
      : { bg:'#ebe9df', surface:'#f7f5ed', line:'#5c5e5a', text:'#111214', muted:'#5f625e', accent:'#d82a18', grid:'#191a1c' };
    const layout = buildChenLayout(schema);
    const esc = escapeXml;
    const line = layout.relationships.map(({relationship:r, center}) => {
      const source = layout.entities.find(e => e.table.name === r.sourceTable);
      const target = layout.entities.find(e => e.table.name === r.targetTable);
      if (!source || !target) return '';
      const sourceEdge = entityBoundary(source, center);
      const targetEdge = r.selfReferencing ? sourceEdge : entityBoundary(target, center);
      const d1 = diamondBoundary(center, sourceEdge);
      const d2 = diamondBoundary(center, targetEdge);
      const a = r.type === 'one-to-one' || r.type === 'one-to-many' ? '1' : r.type === 'many-to-one' || r.type === 'many-to-many' ? 'N' : '?';
      const b = r.type === 'one-to-one' || r.type === 'many-to-one' ? '1' : r.type === 'one-to-many' || r.type === 'many-to-many' ? 'N' : '?';
      const diamond = `${center.x},${center.y-38} ${center.x+72},${center.y} ${center.x},${center.y+38} ${center.x-72},${center.y}`;
      const selfPath = r.selfReferencing ? `<path d="M ${sourceEdge.x} ${sourceEdge.y} C ${sourceEdge.x+120} ${sourceEdge.y-90}, ${center.x+120} ${center.y+90}, ${center.x} ${center.y}" fill="none" stroke="${palette.line}" stroke-width="2"/>` : `<line x1="${d2.x}" y1="${d2.y}" x2="${targetEdge.x}" y2="${targetEdge.y}" stroke="${palette.line}" stroke-width="2"/>`;
      return `<g><line x1="${sourceEdge.x}" y1="${sourceEdge.y}" x2="${d1.x}" y2="${d1.y}" stroke="${palette.line}" stroke-width="2"/>${selfPath}<polygon points="${diamond}" fill="${palette.surface}" stroke="${palette.accent}" stroke-width="2"/><text x="${center.x}" y="${center.y+4}" text-anchor="middle" fill="${palette.text}" font-family="DM Mono,monospace" font-size="10" font-weight="700">${esc(r.type.replaceAll('-', ' ').toUpperCase())}</text><text x="${(sourceEdge.x+d1.x)/2}" y="${(sourceEdge.y+d1.y)/2-9}" fill="${palette.accent}" font-family="DM Mono,monospace" font-size="11" font-weight="700">${a}</text>${r.selfReferencing?'':`<text x="${(d2.x+targetEdge.x)/2}" y="${(d2.y+targetEdge.y)/2-9}" fill="${palette.accent}" font-family="DM Mono,monospace" font-size="11" font-weight="700">${b}</text>`}</g>`;
    }).join('');
    const entities = layout.entities.map(e => `<g><rect x="${e.center.x-e.width/2}" y="${e.center.y-e.height/2}" width="${e.width}" height="${e.height}" fill="${palette.surface}" stroke="${palette.text}" stroke-width="2"/><text x="${e.center.x}" y="${e.center.y+6}" text-anchor="middle" fill="${palette.text}" font-family="Space Grotesk,sans-serif" font-size="15" font-weight="700" letter-spacing="1.5">${esc(e.table.name.toUpperCase())}</text></g>`).join('');
    const attrs = layout.attributes.map(a => {
      const table = layout.entities.find(e=>e.table.name===a.table); const col=table?.table.columns.find(c=>c.name===a.column); if(!table||!col)return '';
      const ry=25, rx=76; const startY=a.side==='top'?table.center.y-table.height/2:table.center.y+table.height/2; const endY=a.side==='top'?a.center.y+ry:a.center.y-ry;
      return `<g><line x1="${table.center.x}" y1="${startY}" x2="${a.center.x}" y2="${endY}" stroke="${palette.line}" stroke-width="1.5"/><ellipse cx="${a.center.x}" cy="${a.center.y}" rx="${rx}" ry="${ry}" fill="${palette.surface}" stroke="${col.primaryKey?palette.accent:palette.line}" stroke-width="${col.primaryKey?2:1.5}"/><text x="${a.center.x}" y="${a.center.y+4}" text-anchor="middle" fill="${palette.muted}" font-family="DM Mono,monospace" font-size="10">${esc(a.column)}${col.primaryKey?' · PK':''}</text></g>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}"><rect width="100%" height="100%" fill="${palette.bg}"/><defs><pattern id="g" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="${palette.grid}" stroke-opacity=".08"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/>${line}${entities}${attrs}</svg>`;
  },

  exportSvg(schema: ParsedSchema, geometry: DiagramGeometry, theme: 'dark' | 'light', name: string, notation: 'modern' | 'chen' = 'modern'): void {
    const svg = notation === 'chen' ? ExportService.buildChenSvg(schema, theme) : ExportService.buildSvg(schema, geometry, theme);
    download(new Blob([svg], { type: 'image/svg+xml' }), `${safeName(name)}-${notation}.svg`);
  },

  async exportPng(
  schema: ParsedSchema,
  geometry: DiagramGeometry,
  theme: 'dark' | 'light',
  name: string,
  scale = 2,
  notation: 'modern' | 'chen' = 'modern')
  : Promise<void> {
    const svg = notation === 'chen' ? ExportService.buildChenSvg(schema, theme) : ExportService.buildSvg(schema, geometry, theme);
    const match = svg.match(/width="(\d+(?:\.\d+)?)" height="(\d+(?:\.\d+)?)"/);
    const width = match ? Number(match[1]) : 1200;
    const height = match ? Number(match[2]) : 800;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));

    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas is not available in this browser.'));
          return;
        }
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) download(blob, `${safeName(name)}-${notation}.png`);
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('The diagram image could not be rendered.'));
      };
      img.src = url;
    });
  },

  buildReport(schema: ParsedSchema, name: string): string {
    const rows = schema.tables.
    map(
      (t) => `<section class="tbl">
      <h3>${escapeXml(t.name)}</h3>
      <p class="meta">${t.columns.length} columns · PK: ${t.primaryKeys.join(', ') || '—'} · FK: ${
      t.foreignKeys.map((f) => f.columns.join('+')).join(', ') || '—'}</p>
      <table><thead><tr><th>Column</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th></tr></thead><tbody>
      ${
      t.columns.
      map(
        (c) =>
        `<tr><td class="mono">${escapeXml(c.name)}</td><td class="mono">${escapeXml(c.dataType)}</td><td>${
        c.nullable ? 'YES' : 'NO'}</td><td>${
        c.primaryKey ? 'PK' : ''}${c.foreignKey ? ' FK' : ''}${
        c.unique && !c.primaryKey ? ' UQ' : ''}</td><td class="mono">${
        escapeXml(c.defaultValue ?? '')}</td></tr>`
      ).
      join('')}
      </tbody></table></section>`
    ).
    join('');

    return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeXml(name)} — SCHEMA BUREAU Schema Report</title>
<style>
:root{color-scheme:light}
body{font-family:Inter,system-ui,sans-serif;margin:0;padding:48px;background:#f7f7f5;color:#16181c;line-height:1.55}
.wrap{max-width:940px;margin:0 auto}
h1{font-size:24px;margin:0 0 4px}
h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:#5c6371;margin:40px 0 12px;border-bottom:1px solid #e2e2de;padding-bottom:8px}
h3{font-size:15px;margin:0 0 2px}
.sub{color:#5c6371;margin:0 0 28px}
.stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.stat{background:#fff;border:1px solid #e2e2de;border-radius:6px;padding:12px}
.stat b{display:block;font-size:20px}
.stat span{font-size:11px;color:#5c6371;text-transform:uppercase;letter-spacing:.05em}
table{width:100%;border-collapse:collapse;font-size:13px;background:#fff;border:1px solid #e2e2de;border-radius:6px;overflow:hidden}
th{text-align:left;background:#f2f2f0;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#5c6371}
th,td{padding:7px 10px;border-bottom:1px solid #ececea}
.mono{font-family:"JetBrains Mono",monospace;font-size:12px}
.tbl{margin-bottom:24px}
.meta{color:#5c6371;font-size:12px;margin:0 0 8px}
pre{background:#fff;border:1px solid #e2e2de;border-radius:6px;padding:16px;overflow:auto;font-family:"JetBrains Mono",monospace;font-size:12px}
li{margin-bottom:6px}
.badge{display:inline-block;padding:1px 6px;border-radius:4px;font-size:11px;border:1px solid #cfcfc9}
.ok{background:#e4f4ec;color:#17794b;border-color:#bfe3d0}
.bad{background:#fdeceb;color:#c8322f;border-color:#f3c9c7}
@media print{body{padding:0;background:#fff}}
</style></head><body><div class="wrap">
<h1>${escapeXml(name)}</h1>
<p class="sub">SCHEMA BUREAU Relational Systems Lab · generated ${new Date().toLocaleString()} · <span class="badge ${
    schema.valid ? 'ok' : 'bad'}">${
    schema.valid ? 'Validation passed' : 'Validation issues found'}</span></p>
<div class="stats">
<div class="stat"><b>${schema.stats.tables}</b><span>Tables</span></div>
<div class="stat"><b>${schema.stats.columns}</b><span>Columns</span></div>
<div class="stat"><b>${schema.stats.primaryKeys}</b><span>Primary keys</span></div>
<div class="stat"><b>${schema.stats.foreignKeys}</b><span>Foreign keys</span></div>
<div class="stat"><b>${schema.stats.relationships}</b><span>Relationships</span></div>
</div>
<h2>Summary</h2><p>${escapeXml(generateSchemaSummary(schema))}</p>
<h2>Entities</h2>${rows || '<p>No tables were parsed.</p>'}
<h2>Relationships</h2>
${
    schema.relationships.length ?
    `<ul>${schema.relationships.
    map(
      (r) =>
      `<li><span class="mono">${escapeXml(r.sourceTable)}.${escapeXml(r.sourceColumn)} → ${escapeXml(
        r.targetTable
      )}.${escapeXml(r.targetColumn)}</span> — ${escapeXml(cardinalityLabel(r))} <em>(${r.confidence} confidence)</em><br><small>${escapeXml(
        r.reason
      )}</small></li>`
    ).
    join('')}</ul>` :
    '<p>No relationships were detected.</p>'}
<h2>Validation</h2>
${

    schema.diagnostics.length ?
    `<ul>${schema.diagnostics.
    map((d) => `<li><b>[${d.severity.toUpperCase()}]</b> ${escapeXml(d.title)} — ${escapeXml(d.message)}</li>`).
    join('')}</ul>` :
    '<p>No validation issues.</p>'}
<h2>Insights</h2>
${

    schema.insights.length ?
    `<ul>${schema.insights.map((i) => `<li><b>${escapeXml(i.title)}</b><br><small>${escapeXml(i.detail)}</small></li>`).join('')}</ul>` :
    '<p>No insights generated.</p>'}
<h2>Source SQL</h2><pre>${
    escapeXml(schema.sql)}</pre>
</div></body></html>`;
  },

  exportReport(schema: ParsedSchema, name: string): void {
    download(new Blob([ExportService.buildReport(schema, name)], { type: 'text/html' }), `${safeName(name)}-report.html`);
  },

  printReport(schema: ParsedSchema, name: string): void {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(ExportService.buildReport(schema, name));
    win.document.close();
  }
};