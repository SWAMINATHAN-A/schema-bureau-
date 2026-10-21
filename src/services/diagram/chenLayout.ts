import type { ParsedSchema, Relationship, TableSchema } from '../../types/schema';

export interface ChenPoint { x: number; y: number; }
export interface ChenEntity { table: TableSchema; center: ChenPoint; width: number; height: number; }
export interface ChenRelationship { relationship: Relationship; center: ChenPoint; source: ChenPoint; target: ChenPoint; }
export interface ChenAttribute { table: string; column: string; center: ChenPoint; side: 'top'|'bottom'|'left'|'right'; }
export interface ChenLayout {
  width: number;
  height: number;
  entities: ChenEntity[];
  relationships: ChenRelationship[];
  attributes: ChenAttribute[];
}

const W = 210;
const H = 82;
const MARGIN_X = 260;
const MARGIN_Y = 210;
const GAP_X = 520;
const GAP_Y = 360;

function relationCenter(a: ChenPoint, b: ChenPoint, index: number, total: number): ChenPoint {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const offset = total > 1 ? (index - (total - 1) / 2) * 82 : 0;
  return { x: (a.x + b.x) / 2 + nx * offset, y: (a.y + b.y) / 2 + ny * offset };
}

function boundaryPoint(from: ChenPoint, to: ChenPoint, width: number, height: number): ChenPoint {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const sx = Math.abs(dx) < 0.001 ? Infinity : (width / 2) / Math.abs(dx);
  const sy = Math.abs(dy) < 0.001 ? Infinity : (height / 2) / Math.abs(dy);
  const scale = Math.min(sx, sy);
  return { x: from.x + dx * scale, y: from.y + dy * scale };
}

export function buildChenLayout(schema: ParsedSchema): ChenLayout {
  const count = schema.tables.length;
  const cols = count <= 2 ? count : Math.ceil(Math.sqrt(count));
  const rows = Math.max(1, Math.ceil(count / Math.max(1, cols)));
  const entities: ChenEntity[] = schema.tables.map((table, index) => {
    const col = index % Math.max(1, cols);
    const row = Math.floor(index / Math.max(1, cols));
    return { table, center: { x: MARGIN_X + col * GAP_X, y: MARGIN_Y + row * GAP_Y }, width: W, height: H };
  });
  const map = new Map(entities.map((e) => [e.table.name, e]));

  const pairCounts = new Map<string, number>();
  schema.relationships.forEach((r) => {
    const key = [r.sourceTable, r.targetTable].sort().join('::');
    pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
  });
  const pairIndex = new Map<string, number>();

  const relationships: ChenRelationship[] = schema.relationships.map((relationship) => {
    const sourceEntity = map.get(relationship.sourceTable);
    const targetEntity = map.get(relationship.targetTable);
    const source = sourceEntity?.center ?? { x: 0, y: 0 };
    const target = targetEntity?.center ?? { x: 500, y: 300 };
    const key = [relationship.sourceTable, relationship.targetTable].sort().join('::');
    const index = pairIndex.get(key) ?? 0;
    pairIndex.set(key, index + 1);
    const total = pairCounts.get(key) ?? 1;
    const center = relationship.selfReferencing
      ? { x: source.x + 170, y: source.y - 120 }
      : relationCenter(source, target, index, total);
    return { relationship, center, source, target };
  });

  const attributes: ChenAttribute[] = [];
  entities.forEach((entity) => {
    const cols = entity.table.columns.slice(0, 12);
    cols.forEach((column, index) => {
      const side = index < Math.ceil(cols.length / 2) ? 'top' : 'bottom';
      const sideIndex = side === 'top' ? index : index - Math.ceil(cols.length / 2);
      const countOnSide = side === 'top' ? Math.ceil(cols.length / 2) : Math.floor(cols.length / 2);
      const spacing = 185;
      const start = entity.center.x - ((countOnSide - 1) * spacing) / 2;
      attributes.push({
        table: entity.table.name,
        column: column.name,
        center: { x: start + sideIndex * spacing, y: entity.center.y + (side === 'top' ? -155 : 155) },
        side
      });
    });
  });

  const maxX = Math.max(1200, ...entities.map((e) => e.center.x + 300), ...attributes.map((a) => a.center.x + 100));
  const maxY = Math.max(800, ...entities.map((e) => e.center.y + 300), ...attributes.map((a) => a.center.y + 70));
  return { width: maxX + 80, height: maxY + 80, entities, relationships, attributes };
}

export function entityBoundary(entity: ChenEntity, toward: ChenPoint): ChenPoint {
  return boundaryPoint(entity.center, toward, entity.width, entity.height);
}

export function diamondBoundary(center: ChenPoint, toward: ChenPoint, halfW = 72, halfH = 38): ChenPoint {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const denom = Math.abs(dx) / Math.max(1, halfW) + Math.abs(dy) / Math.max(1, halfH);
  const scale = denom > 0 ? 1 / denom : 0;
  return { x: center.x + dx * scale, y: center.y + dy * scale };
}
