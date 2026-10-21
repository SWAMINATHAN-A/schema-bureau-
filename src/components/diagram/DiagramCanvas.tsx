import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeChange,
  applyNodeChanges } from
'reactflow';
import {
  ExpandIcon,
  LayoutGridIcon,
  MaximizeIcon,
  MinimizeIcon,
  RotateCcwIcon,
  ZoomInIcon,
  ZoomOutIcon } from
'lucide-react';
import { EntityNode } from './EntityNode';
import { IconButton } from '../common/IconButton';
import { Tooltip } from '../common/Tooltip';
import { buildEdges, buildNodes, layoutGraph, type EntityNodeData } from '../../services/diagram/layout';
import type { ParsedSchema } from '../../types/schema';
import type { Selection } from '../../contexts/SchemaContext';
import type { DiagramGeometry } from '../../services/exportService';
import { cn } from '../../utils/cn';

const nodeTypes = { entity: EntityNode };

export interface DiagramCanvasProps {
  schema: ParsedSchema;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  visibleTables?: string[];
  visibleRelationships?: string[];
  highlightColumns?: string[];
  animatedRelationships?: string[];
  onGeometry?: (geometry: DiagramGeometry) => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}

function Canvas({
  schema,
  selection,
  onSelect,
  visibleTables,
  visibleRelationships,
  highlightColumns,
  animatedRelationships,
  onGeometry,
  fullscreen,
  onToggleFullscreen
}: DiagramCanvasProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [nodes, setNodes] = useState<Node<EntityNodeData>[]>([]);
  const [direction, setDirection] = useState<'LR' | 'TB'>('LR');
  const positionsRef = useRef<Record<string, {x: number;y: number;}>>({});

  const edges: Edge[] = useMemo(
    () =>
    buildEdges(schema.relationships, {
      visibleRelationships,
      animatedIds: animatedRelationships
    }).map((edge) => ({
      ...edge,
      selected: selection.kind === 'relationship' && selection.id === edge.id
    })),
    [schema.relationships, visibleRelationships, animatedRelationships, selection]
  );

  const relayout = useCallback(
    (dir: 'LR' | 'TB', preservePositions: boolean) => {
      const base = buildNodes(schema, { visibleTables, highlightColumns });
      const withEdges = buildEdges(schema.relationships, { visibleRelationships });
      const laid = layoutGraph(base, withEdges, dir);
      const next = laid.map((node) => {
        const saved = preservePositions ? positionsRef.current[node.id] : undefined;
        return saved ? { ...node, position: saved } : node;
      });
      next.forEach((node) => {
        positionsRef.current[node.id] = node.position;
      });
      setNodes(next);
      window.setTimeout(() => fitView({ padding: 0.16, duration: 260 }), 30);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schema, visibleTables, visibleRelationships, highlightColumns, fitView]
  );

  // A new parse result always clears the graph and rebuilds it from scratch.
  useEffect(() => {
    positionsRef.current = {};
    relayout(direction, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema.parsedAt]);

  // Simulation reveals / highlight changes reuse existing positions.
  useEffect(() => {
    relayout(direction, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleTables?.join('|'), visibleRelationships?.join('|'), highlightColumns?.join('|')]);

  useEffect(() => {
    const selectedId = selection.kind === 'table' ? selection.id : null;
    setNodes((current) => current.map((n) => ({ ...n, selected: n.id === selectedId })));
  }, [selection]);

  useEffect(() => {
    if (!onGeometry) return;
    onGeometry({
      nodes: nodes.map((n) => ({
        id: n.id,
        x: n.position.x,
        y: n.position.y,
        width: n.width ?? 272,
        height: n.height ?? 120
      })),
      edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: String(e.label ?? '') }))
    });
  }, [nodes, edges, onGeometry]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((current) => {
      const next = applyNodeChanges(changes, current) as Node<EntityNodeData>[];
      next.forEach((node) => {
        positionsRef.current[node.id] = node.position;
      });
      return next;
    });
  }, []);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => onSelect({ kind: 'table', id: node.id })}
        onEdgeClick={(_, edge) => onSelect({ kind: 'relationship', id: edge.id })}
        onPaneClick={() => onSelect({ kind: 'none' })}
        proOptions={{ hideAttribution: true }}
        minZoom={0.15}
        maxZoom={2.2}
        fitView
        nodesConnectable={false}
        elementsSelectable
        className="bg-bg">
        
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--nx-grid)" />
      </ReactFlow>

      <div className="absolute left-3 top-3 flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5">
        <IconButton label="Zoom in" size="sm" onClick={() => zoomIn({ duration: 160 })}>
          <ZoomInIcon className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton label="Zoom out" size="sm" onClick={() => zoomOut({ duration: 160 })}>
          <ZoomOutIcon className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton label="Fit view" size="sm" onClick={() => fitView({ padding: 0.16, duration: 240 })}>
          <ExpandIcon className="h-3.5 w-3.5" />
        </IconButton>
        <span className="mx-0.5 h-4 w-px bg-line" />
        <IconButton label="Reset layout" size="sm" onClick={() => relayout(direction, false)}>
          <RotateCcwIcon className="h-3.5 w-3.5" />
        </IconButton>
        <Tooltip content={direction === 'LR' ? 'Auto layout — switch to top-down' : 'Auto layout — switch to left-right'}>
          <button
            type="button"
            onClick={() => {
              const next = direction === 'LR' ? 'TB' : 'LR';
              setDirection(next);
              positionsRef.current = {};
              relayout(next, false);
            }}
            aria-label="Toggle automatic layout direction"
            className="inline-flex h-6 items-center gap-1 rounded border border-transparent px-1.5 font-mono text-2xs text-muted transition-colors duration-150 ease-out hover:border-line hover:bg-surface2 hover:text-fg">
            
            <LayoutGridIcon className="h-3.5 w-3.5" />
            {direction}
          </button>
        </Tooltip>
        <span className="mx-0.5 h-4 w-px bg-line" />
        <IconButton
          label={fullscreen ? 'Exit fullscreen' : 'Fullscreen diagram'}
          size="sm"
          onClick={onToggleFullscreen}>
          
          {fullscreen ? <MinimizeIcon className="h-3.5 w-3.5" /> : <MaximizeIcon className="h-3.5 w-3.5" />}
        </IconButton>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute bottom-3 left-3 rounded border border-line bg-surface px-2 py-1 font-mono text-2xs text-faint'
        )}>
        
        {nodes.length} entities · {edges.length} relationships
      </div>
    </div>);

}

export function DiagramCanvas(props: DiagramCanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>);

}