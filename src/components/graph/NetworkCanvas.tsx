import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Graph, GraphEdge, NodeId } from '../../types/graph.ts'
import {
  addNode,
  connectNodes,
  deleteEdge,
  deleteNode,
  updateNodePosition,
} from '../../graph/operations.ts'

const VIEW = { w: 800, h: 480 }
const GRID = 20
const NODE_R = 22

export interface NetworkCanvasProps {
  graph: Graph
  onGraphChange: (g: Graph) => void
  sourceId: NodeId | null
  destId: NodeId | null
  selectedNodeId: NodeId | null
  onSelectNode: (id: NodeId | null) => void
  mode: 'view' | 'select' | 'add' | 'connect' | 'delete'
  snapToGrid: boolean
  highlightPath?: NodeId[]
  highlightEdges?: string[]
  activeEdgeId?: string | null
  packetPos?: { x: number; y: number } | null
  onToggleEdge?: (edgeId: string) => void
  showFailureControls?: boolean
}

function snap(v: number, enabled: boolean) {
  return enabled ? Math.round(v / GRID) * GRID : v
}

function edgeMid(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

function perpOffset(a: { x: number; y: number }, b: { x: number; y: number }, dist = 14) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  return { x: (-dy / len) * dist, y: (dx / len) * dist }
}

export function NetworkCanvas({
  graph,
  onGraphChange,
  sourceId,
  destId,
  selectedNodeId,
  onSelectNode,
  mode,
  snapToGrid,
  highlightPath = [],
  highlightEdges = [],
  activeEdgeId,
  packetPos,
  onToggleEdge,
  showFailureControls,
}: NetworkCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ id: NodeId; pointerId: number } | null>(null)
  const [connectFrom, setConnectFrom] = useState<NodeId | null>(null)
  const [pendingWeight, setPendingWeight] = useState('1')

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]))
  const pathSet = new Set(highlightPath)
  const pathEdgeSet = new Set(highlightEdges)

  const toSvg = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    const p = pt.matrixTransform(ctm.inverse())
    return { x: snap(p.x, snapToGrid), y: snap(p.y, snapToGrid) }
  }, [snapToGrid])

  const onPointerDownNode = (e: ReactPointerEvent, id: NodeId) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.stopPropagation()
    if (mode === 'delete') {
      const r = deleteNode(graph, id)
      if (r.ok) onGraphChange(r.value)
      return
    }
    if (mode === 'connect') {
      if (!connectFrom) setConnectFrom(id)
      else if (connectFrom !== id) {
        const w = Number(pendingWeight)
        const r = connectNodes(graph, connectFrom, id, w)
        if (r.ok) onGraphChange(r.value)
        setConnectFrom(null)
      }
      return
    }
    onSelectNode(id)
    if (mode === 'select') {
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
      dragRef.current = { id, pointerId: e.pointerId }
    }
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== e.pointerId) return
    const { x, y } = toSvg(e.clientX, e.clientY)
    const r = updateNodePosition(graph, drag.id, x, y)
    if (r.ok) onGraphChange(r.value)
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null
  }

  const onCanvasClick = (e: ReactPointerEvent) => {
    if (mode !== 'add') return
    if ((e.target as SVGElement).dataset?.canvas !== 'true') return
    const { x, y } = toSvg(e.clientX, e.clientY)
    const id = `N${graph.nodes.length + 1}`
    const r = addNode(graph, { id, label: id, x, y })
    if (r.ok) onGraphChange(r.value)
  }

  const renderEdge = (edge: GraphEdge) => {
    const a = nodeMap.get(edge.source)
    const b = nodeMap.get(edge.target)
    if (!a || !b) return null
    const onRoute = pathEdgeSet.has(edge.id) || activeEdgeId === edge.id
    const failed = !edge.active
    const mid = edgeMid(a, b)
    const off = perpOffset(a, b)
    const lx = mid.x + off.x
    const ly = mid.y + off.y

    return (
      <g key={edge.id}>
        <line
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          stroke={failed ? 'var(--danger)' : onRoute ? 'var(--accent-cyan)' : 'var(--border)'}
          strokeWidth={onRoute ? 3 : 2}
          strokeDasharray={failed ? '6 4' : undefined}
          className={onRoute && !failed ? 'route-flow' : undefined}
        />
        <text
          x={lx}
          y={ly}
          textAnchor="middle"
          className="font-mono text-[11px] fill-[var(--text-muted)]"
        >
          {edge.weight}
          {failed ? ' ✕' : ''}
        </text>
        {mode === 'delete' && (
          <line
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="transparent"
            strokeWidth={16}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              const r = deleteEdge(graph, edge.id)
              if (r.ok) onGraphChange(r.value)
            }}
          />
        )}
        {showFailureControls && onToggleEdge && (
          <foreignObject x={lx - 20} y={ly + 8} width={40} height={24}>
            <button
              type="button"
              className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-1 text-[9px]"
              aria-label={edge.active ? 'Mark link failed' : 'Restore link'}
              onClick={(ev) => {
                ev.stopPropagation()
                onToggleEdge(edge.id)
              }}
            >
              {edge.active ? 'Fail' : 'Fix'}
            </button>
          </foreignObject>
        )}
      </g>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%)`,
        }}
      />
      {mode === 'connect' && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-1 text-xs">
          <span className="text-[var(--text-muted)]">Weight</span>
          <input
            className="w-14 rounded border border-[var(--border)] bg-[var(--surface)] px-1 font-mono"
            value={pendingWeight}
            onChange={(e) => setPendingWeight(e.target.value)}
            aria-label="Edge weight for new connection"
          />
          {connectFrom && <span className="font-mono">from {connectFrom}</span>}
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        className="relative z-[1] h-auto w-full touch-none"
        style={{ touchAction: 'none', minHeight: 280 }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerDown={onCanvasClick}
        role="img"
        aria-label="Network graph canvas"
      >
        <defs>
          <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
            <circle cx={1} cy={1} r={0.8} fill="var(--border)" />
          </pattern>
        </defs>
        <rect data-canvas="true" width={VIEW.w} height={VIEW.h} fill="url(#grid)" opacity={0.35} />
        {graph.edges.map(renderEdge)}
        {graph.nodes.map((node) => {
          const isSource = node.id === sourceId
          const isDest = node.id === destId
          const selected = node.id === selectedNodeId
          const onPath = pathSet.has(node.id)
          const shape = isSource ? 'source' : isDest ? 'dest' : onPath ? 'route' : 'default'

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              tabIndex={0}
              role="button"
              aria-label={`Node ${node.label}${isSource ? ', source' : ''}${isDest ? ', destination' : ''}`}
              onPointerDown={(e) => onPointerDownNode(e, node.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSelectNode(node.id)
                if (e.key === 'Delete' && mode === 'delete') {
                  const r = deleteNode(graph, node.id)
                  if (r.ok) onGraphChange(r.value)
                }
                const step = e.shiftKey ? GRID : 4
                let nx = node.x
                let ny = node.y
                if (e.key === 'ArrowLeft') nx -= step
                if (e.key === 'ArrowRight') nx += step
                if (e.key === 'ArrowUp') ny -= step
                if (e.key === 'ArrowDown') ny += step
                if (nx !== node.x || ny !== node.y) {
                  e.preventDefault()
                  const r = updateNodePosition(graph, node.id, snap(nx, snapToGrid), snap(ny, snapToGrid))
                  if (r.ok) onGraphChange(r.value)
                }
              }}
              style={{ cursor: mode === 'select' ? 'grab' : 'pointer' }}
            >
              <circle
                r={NODE_R + 4}
                fill="none"
                stroke={
                  shape === 'source'
                    ? 'var(--success)'
                    : shape === 'dest'
                      ? 'var(--warning)'
                      : selected
                        ? 'var(--accent)'
                        : 'transparent'
                }
                strokeWidth={2}
                strokeDasharray={shape === 'dest' ? '4 2' : undefined}
              />
              <rect
                x={-NODE_R}
                y={-NODE_R}
                width={NODE_R * 2}
                height={NODE_R * 2}
                rx={8}
                fill="var(--surface-raised)"
                stroke={onPath ? 'var(--accent-cyan)' : 'var(--border)'}
                strokeWidth={selected ? 2.5 : 1.5}
              />
              {isSource && (
                <text y={-NODE_R - 6} textAnchor="middle" className="text-[9px] fill-[var(--success)]">
                  SRC
                </text>
              )}
              {isDest && (
                <text y={-NODE_R - 6} textAnchor="middle" className="text-[9px] fill-[var(--warning)]">
                  DST
                </text>
              )}
              <text
                y={5}
                textAnchor="middle"
                className="font-mono text-sm font-medium fill-[var(--text)]"
              >
                {node.label}
              </text>
            </g>
          )
        })}
        {packetPos && (
          <circle cx={packetPos.x} cy={packetPos.y} r={7} fill="var(--accent-cyan)" opacity={0.95}>
            <title>Packet (visual simulation)</title>
          </circle>
        )}
      </svg>
    </div>
  )
}

export function interpolatePacket(
  graph: Graph,
  route: NodeId[],
  progress: number,
): { x: number; y: number } | null {
  if (route.length < 2) return null
  const nodes = route
    .map((id) => graph.nodes.find((n) => n.id === id))
    .filter(Boolean) as { x: number; y: number }[]
  if (nodes.length < 2) return null
  const seg = Math.min(nodes.length - 2, Math.floor(progress * (nodes.length - 1)))
  const local = progress * (nodes.length - 1) - seg
  const a = nodes[seg]!
  const b = nodes[seg + 1]!
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local }
}

export function pathEdgeIds(graph: Graph, route: NodeId[]): string[] {
  const ids: string[] = []
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i]!
    const b = route[i + 1]!
    const e = graph.edges.find(
      (ed) =>
        ed.active &&
        ((ed.source === a && ed.target === b) || (ed.source === b && ed.target === a)),
    )
    if (e) ids.push(e.id)
  }
  return ids
}
