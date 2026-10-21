import React from 'react';
import { motion } from 'framer-motion';

interface VisualTable {
  name: string;
  x: number;
  y: number;
  rows: {label: string;key?: 'pk' | 'fk';}[];
}

const TABLES: VisualTable[] = [
{
  name: 'DEPARTMENT',
  x: 40,
  y: 46,
  rows: [
  { label: 'department_id', key: 'pk' },
  { label: 'name' },
  { label: 'building' }]

},
{
  name: 'STUDENT',
  x: 262,
  y: 24,
  rows: [
  { label: 'student_id', key: 'pk' },
  { label: 'email' },
  { label: 'department_id', key: 'fk' }]

},
{
  name: 'COURSE',
  x: 262,
  y: 232,
  rows: [
  { label: 'course_id', key: 'pk' },
  { label: 'title' },
  { label: 'department_id', key: 'fk' }]

},
{
  name: 'ENROLLMENT',
  x: 486,
  y: 128,
  rows: [
  { label: 'student_id', key: 'pk' },
  { label: 'course_id', key: 'pk' },
  { label: 'grade' }]

}];


const WIDTH = 176;
const HEADER = 24;
const ROW = 20;

function height(table: VisualTable): number {
  return HEADER + table.rows.length * ROW + 6;
}

const EDGES: {from: number;to: number;label: string;}[] = [
{ from: 0, to: 1, label: '1:N' },
{ from: 0, to: 2, label: '1:N' },
{ from: 1, to: 3, label: '1:N' },
{ from: 2, to: 3, label: '1:N' }];


export function SchemaVisual() {
  return (
    <svg
      viewBox="0 0 700 400"
      className="h-full w-full"
      role="img"
      aria-label="An entity relationship diagram of a university schema, drawn as connected tables">
      
      <defs>
        <pattern id="nx-grid" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0V26" fill="none" stroke="var(--nx-border)" strokeWidth="0.6" opacity="0.5" />
        </pattern>
        <radialGradient id="nx-fade" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="700" height="400" fill="url(#nx-grid)" />
      <rect width="700" height="400" fill="url(#nx-fade)" />

      {EDGES.map((edge, index) => {
        const a = TABLES[edge.from];
        const b = TABLES[edge.to];
        const x1 = a.x + WIDTH;
        const y1 = a.y + height(a) / 2;
        const x2 = b.x;
        const y2 = b.y + height(b) / 2;
        const mx = (x1 + x2) / 2;
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <motion.path
              d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="var(--nx-border-strong)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.5 + index * 0.12, ease: [0.23, 1, 0.32, 1] }} />
            
            <motion.circle
              r="2"
              fill="var(--nx-accent)"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0] }}
              transition={{ duration: 3.6, delay: 1.4 + index * 0.5, repeat: Infinity, ease: 'linear' }}>
              
              <animateMotion
                dur="3.6s"
                begin={`${1.4 + index * 0.5}s`}
                repeatCount="indefinite"
                path={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} />
              
            </motion.circle>
            <text
              x={mx}
              y={(y1 + y2) / 2 - 6}
              textAnchor="middle"
              className="fill-[var(--nx-faint)] font-mono"
              fontSize="9">
              
              {edge.label}
            </text>
          </g>);

      })}

      {TABLES.map((table, index) =>
      <motion.g
        key={table.name}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.12, ease: [0.23, 1, 0.32, 1] }}>
        
          <rect
          x={table.x}
          y={table.y}
          width={WIDTH}
          height={height(table)}
          rx="5"
          fill="var(--nx-surface)"
          stroke="var(--nx-border-strong)" />
        
          <rect x={table.x} y={table.y} width={WIDTH} height={HEADER} rx="5" fill="var(--nx-surface-2)" />
          <rect x={table.x} y={table.y + HEADER - 5} width={WIDTH} height="5" fill="var(--nx-surface-2)" />
          <line
          x1={table.x}
          y1={table.y + HEADER}
          x2={table.x + WIDTH}
          y2={table.y + HEADER}
          stroke="var(--nx-border)" />
        
          <text x={table.x + 10} y={table.y + 16} className="fill-[var(--nx-text)]" fontSize="10" fontWeight="600" letterSpacing="0.08em">
            {table.name}
          </text>
          {table.rows.map((row, i) =>
        <g key={row.label}>
              {row.key ?
          <text
            x={table.x + 10}
            y={table.y + HEADER + 14 + i * ROW}
            className={row.key === 'pk' ? 'fill-[var(--nx-accent)]' : 'fill-[var(--nx-faint)]'}
            fontSize="7.5"
            fontFamily="monospace">
            
                  {row.key.toUpperCase()}
                </text> :
          null}
              <text
            x={table.x + 32}
            y={table.y + HEADER + 14 + i * ROW}
            className="fill-[var(--nx-muted)]"
            fontSize="9.5"
            fontFamily="monospace">
            
                {row.label}
              </text>
            </g>
        )}
        </motion.g>
      )}
    </svg>);

}