import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExpandIcon, MaximizeIcon, MinimizeIcon, RotateCcwIcon, ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import type { ParsedSchema } from '../../types/schema';
import type { Selection } from '../../contexts/SchemaContext';
import type { DiagramGeometry } from '../../services/exportService';
import { cardinalityLabel } from '../../services/explanationEngine';
import { buildChenLayout, diamondBoundary, entityBoundary } from '../../services/diagram/chenLayout';
import { IconButton } from '../common/IconButton';

interface Props {
  schema: ParsedSchema;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onGeometry?: (geometry: DiagramGeometry) => void;
  visibleTables?: string[];
  visibleRelationships?: string[];
  highlightColumns?: string[];
}

const DW = 144;
const DH = 76;

function diamondPoints(cx: number, cy: number, w: number, h: number) {
  return `${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`;
}

function shortCardinality(type: string) {
  if (type === 'one-to-one') return ['1', '1'];
  if (type === 'one-to-many') return ['1', 'N'];
  if (type === 'many-to-one') return ['N', '1'];
  if (type === 'many-to-many') return ['N', 'N'];
  return ['?', '?'];
}

export function ChenDiagramCanvas({ schema, selection, onSelect, fullscreen, onToggleFullscreen, onGeometry, visibleTables, visibleRelationships, highlightColumns = [] }: Props) {
  const [scale, setScale] = useState(0.74);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{x:number;y:number;ox:number;oy:number}|null>(null);
  const layout = useMemo(() => buildChenLayout({ ...schema, tables: visibleTables ? schema.tables.filter(t => visibleTables.includes(t.name)) : schema.tables, relationships: visibleRelationships ? schema.relationships.filter(r => visibleRelationships.includes(r.id)) : schema.relationships }), [schema, visibleTables, visibleRelationships]);

  useEffect(() => {
    onGeometry?.({
      nodes: layout.entities.map(e => ({ id: e.table.name, x: e.center.x - e.width / 2, y: e.center.y - e.height / 2, width: e.width, height: e.height })),
      edges: layout.relationships.map(r => ({ id: r.relationship.id, source: r.relationship.sourceTable, target: r.relationship.targetTable, label: cardinalityLabel(r.relationship) }))
    });
  }, [layout, onGeometry]);

  const zoom = (delta: number) => setScale(s => Math.min(1.5, Math.max(0.35, Number((s + delta).toFixed(2)))));
  const reset = () => { setScale(0.74); setOffset({ x: 0, y: 0 }); };
  const selectedTable = selection.kind === 'table' ? selection.id : null;
  const selectedRel = selection.kind === 'relationship' ? selection.id : null;

  return <div className={`relative h-full w-full overflow-hidden chen-stage ${fullscreen ? 'chen-fullscreen' : ''}`}
    onPointerDown={e => { if (e.button === 0) drag.current = { x:e.clientX, y:e.clientY, ox:offset.x, oy:offset.y }; }}
    onPointerMove={e => { if (!drag.current) return; setOffset({ x:drag.current.ox + e.clientX-drag.current.x, y:drag.current.oy + e.clientY-drag.current.y }); }}
    onPointerUp={() => { drag.current = null; }} onPointerLeave={() => { drag.current = null; }}
    onWheel={e => { e.preventDefault(); zoom(e.deltaY > 0 ? -0.06 : 0.06); }}>
    <svg className="chen-svg" viewBox={`0 0 ${layout.width} ${layout.height}`} style={{ width:layout.width, height:layout.height, left:`calc(50% - ${layout.width/2}px)`, top:`calc(50% - ${layout.height/2}px)`, transform:`translate(${offset.x}px,${offset.y}px) scale(${scale})` }} role="img" aria-label="Chen entity relationship diagram">
      <defs><pattern id="chenGrid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="currentColor" strokeWidth="1" opacity=".1" /></pattern></defs>
      <rect width={layout.width} height={layout.height} fill="url(#chenGrid)" />
      {layout.relationships.map(({ relationship:r, center }) => {
        const source = layout.entities.find(e => e.table.name === r.sourceTable);
        const target = layout.entities.find(e => e.table.name === r.targetTable);
        if (!source || !target) return null;
        const active = selectedRel === r.id;
        const [a,b] = shortCardinality(r.type);
        const sourceEdge = entityBoundary(source, center);
        const targetEdge = r.selfReferencing ? entityBoundary(source, { x:center.x, y:center.y+20 }) : entityBoundary(target, center);
        const d1 = diamondBoundary(center, sourceEdge);
        const d2 = diamondBoundary(center, targetEdge);
        return <g key={r.id} className={active ? 'chen-active' : ''}>
          <line x1={sourceEdge.x} y1={sourceEdge.y} x2={d1.x} y2={d1.y} className="chen-line" />
          {!r.selfReferencing && <line x1={d2.x} y1={d2.y} x2={targetEdge.x} y2={targetEdge.y} className="chen-line" />}
          {r.selfReferencing && <path d={`M ${sourceEdge.x} ${sourceEdge.y} C ${sourceEdge.x+120} ${sourceEdge.y-90}, ${center.x+120} ${center.y+90}, ${center.x} ${center.y}`} className="chen-line" fill="none" />}
          <polygon points={diamondPoints(center.x,center.y,DW,DH)} className="chen-diamond" onClick={e => {e.stopPropagation();onSelect({kind:'relationship',id:r.id});}} />
          <text x={center.x} y={center.y+4} textAnchor="middle" className="chen-rel-label" pointerEvents="none">{r.type.replaceAll('-',' ').toUpperCase()}</text>
          <text x={(sourceEdge.x+d1.x)/2} y={(sourceEdge.y+d1.y)/2-8} className="chen-cardinality">{r.selfReferencing ? '1' : a}</text>
          {!r.selfReferencing && <text x={(d2.x+targetEdge.x)/2} y={(d2.y+targetEdge.y)/2-8} className="chen-cardinality">{b}</text>}
        </g>;
      })}
      {layout.entities.map(entity => {
        const active = selectedTable === entity.table.name;
        return <g key={entity.table.name} className={active ? 'chen-active' : ''} onClick={e => {e.stopPropagation();onSelect({kind:'table',id:entity.table.name});}}>
          <rect x={entity.center.x-entity.width/2} y={entity.center.y-entity.height/2} width={entity.width} height={entity.height} className="chen-entity" />
          <text x={entity.center.x} y={entity.center.y+5} textAnchor="middle" className="chen-entity-label">{entity.table.name.toUpperCase()}</text>
        </g>;
      })}
      {layout.attributes.map(attr => {
        const table = layout.entities.find(e => e.table.name === attr.table);
        const col = table?.table.columns.find(c => c.name === attr.column);
        if (!table || !col) return null;
        const highlighted = highlightColumns.some(c => c.toLowerCase() === `${attr.table}.${attr.column}`.toLowerCase());
        const rx = 76; const ry = 25;
        const lineStart = attr.side === 'top' ? {x:table.center.x,y:table.center.y-table.height/2} : {x:table.center.x,y:table.center.y+table.height/2};
        const lineEnd = attr.side === 'top' ? {x:attr.center.x,y:attr.center.y+ry} : {x:attr.center.x,y:attr.center.y-ry};
        return <g key={`${attr.table}.${attr.column}`}>
          <line x1={lineStart.x} y1={lineStart.y} x2={lineEnd.x} y2={lineEnd.y} className="chen-attribute-line" />
          <ellipse cx={attr.center.x} cy={attr.center.y} rx={rx} ry={ry} className={`chen-attribute ${col.primaryKey ? 'chen-pk':''} ${highlighted ? 'chen-highlight':''}`} />
          <text x={attr.center.x} y={attr.center.y+4} textAnchor="middle" className="chen-attribute-label">{col.name}{col.primaryKey ? '  PK' : ''}</text>
        </g>;
      })}
    </svg>
    <div className="chen-toolbar foundry-floating-toolbar">
      <IconButton label="Zoom in" size="sm" onClick={() => zoom(.08)}><ZoomInIcon className="h-3.5 w-3.5"/></IconButton>
      <IconButton label="Zoom out" size="sm" onClick={() => zoom(-.08)}><ZoomOutIcon className="h-3.5 w-3.5"/></IconButton>
      <IconButton label="Fit view" size="sm" onClick={reset}><ExpandIcon className="h-3.5 w-3.5"/></IconButton>
      <IconButton label="Reset view" size="sm" onClick={reset}><RotateCcwIcon className="h-3.5 w-3.5"/></IconButton>
      <span className="foundry-toolbar-divider"/><span className="foundry-mode-label">CHEN / {Math.round(scale*100)}%</span>
      <IconButton label={fullscreen?'Exit fullscreen':'Fullscreen diagram'} size="sm" onClick={onToggleFullscreen}>{fullscreen?<MinimizeIcon className="h-3.5 w-3.5"/>:<MaximizeIcon className="h-3.5 w-3.5"/>}</IconButton>
    </div>
    <div className="foundry-floating-card chen-legend"><span><i className="legend-entity"/> ENTITY</span><span><i className="legend-rel"/> RELATIONSHIP</span><span><i className="legend-attr"/> ATTRIBUTE</span></div>
    <div className="foundry-canvas-meta">CHEN NOTATION · {layout.entities.length} ENTITIES · {layout.relationships.length} RELATIONSHIPS · DRAG TO PAN · WHEEL TO ZOOM</div>
  </div>;
}
