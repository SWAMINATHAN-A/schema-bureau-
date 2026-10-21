import dagre from 'dagre';
import type { Edge, Node } from 'reactflow';
import { MarkerType } from 'reactflow';
import type { ParsedSchema, Relationship, TableSchema } from '../../types/schema';
import { cardinalityShort } from '../explanationEngine';

export const NODE_WIDTH = 272;
export const ROW_HEIGHT = 24;
export const HEADER_HEIGHT = 40;

export interface EntityNodeData {
  table: TableSchema;
  isJunction: boolean;
  highlightColumns: string[];
  dimmed: boolean;
}

export function nodeHeight(table: TableSchema): number {
  return HEADER_HEIGHT + Math.max(table.columns.length, 1) * ROW_HEIGHT + 10;
}

export function buildNodes(
schema: ParsedSchema,
options: {visibleTables?: string[];highlightColumns?: string[];dimmedTables?: string[];} = {})
: Node<EntityNodeData>[] {
  const junctions = new Set(schema.junctionTables.map((j) => j.table.toLowerCase()));
  return schema.tables.
  filter((t) => !options.visibleTables || options.visibleTables.some((v) => v.toLowerCase() === t.name.toLowerCase())).
  map((table) => ({
    id: table.name,
    type: 'entity',
    position: { x: 0, y: 0 },
    data: {
      table,
      isJunction: junctions.has(table.name.toLowerCase()),
      highlightColumns: (options.highlightColumns ?? []).filter((c) =>
      c.toLowerCase().startsWith(`${table.name.toLowerCase()}.`)
      ),
      dimmed: Boolean(options.dimmedTables?.some((d) => d.toLowerCase() === table.name.toLowerCase()))
    },
    width: NODE_WIDTH,
    height: nodeHeight(table)
  }));
}

export function buildEdges(
relationships: Relationship[],
options: {visibleRelationships?: string[];animatedIds?: string[];} = {})
: Edge[] {
  return relationships.
  filter((r) => !options.visibleRelationships || options.visibleRelationships.includes(r.id)).
  map((r) => ({
    id: r.id,
    source: r.sourceTable,
    target: r.targetTable,
    type: 'smoothstep',
    label: cardinalityShort(r),
    labelShowBg: true,
    labelBgPadding: [4, 2] as [number, number],
    className: options.animatedIds?.includes(r.id) ? 'nx-edge-anim' : undefined,
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: 'var(--nx-border-strong)' },
    data: { relationship: r }
  }));
}

export function layoutGraph(
nodes: Node<EntityNodeData>[],
edges: Edge[],
direction: 'LR' | 'TB' = 'LR')
: Node<EntityNodeData>[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 48, ranksep: 110, marginx: 40, marginy: 40 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: node.height ?? nodeHeight(node.data.table) });
  });
  edges.forEach((edge) => {
    if (edge.source !== edge.target) g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const height = node.height ?? nodeHeight(node.data.table);
    return {
      ...node,
      position: pos ?
      { x: Math.round(pos.x - NODE_WIDTH / 2), y: Math.round(pos.y - height / 2) } :
      node.position
    };
  });
}