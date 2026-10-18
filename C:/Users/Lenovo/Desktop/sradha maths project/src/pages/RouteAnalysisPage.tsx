import { useMemo, useState } from 'react'
import {
  interpolatePacket,
  NetworkCanvas,
  pathEdgeIds,
} from '../components/graph/NetworkCanvas.tsx'
import { StatusBar } from '../components/graph/StatusBar.tsx'
import { ResultsPanel } from '../components/panels/ResultsPanel.tsx'
import { useApp } from '../hooks/AppProvider.tsx'
import { useGraphAnalysis } from '../hooks/useGraphAnalysis.ts'
import { usePacketAnimation } from '../hooks/usePacketAnimation.ts'
import { setEdgeActive } from '../graph/operations.ts'
import { PATH_ENUM_WARNING } from '../types/app.ts'
import type { PathResult } from '../types/graph.ts'

type SortKey = 'hops' | 'weight' | 'lex'

export function RouteAnalysisPage() {
  const {
    graph,
    setGraph,
    applyGraphOp,
    sourceId,
    destId,
    setSourceId,
    setDestId,
    selectedPathKey,
    setSelectedPathKey,
    animSpeed,
    setAnimSpeed,
    prevShortestCost,
    setPrevShortestCost,
    restoreEdges,
  } = useApp()
  const analysis = useGraphAnalysis(graph, sourceId, destId)
  const [sortKey, setSortKey] = useState<SortKey>('weight')
  const [sortAsc, setSortAsc] = useState(true)

  const sortedPaths = useMemo(() => {
    const paths = [...analysis.enumeration.paths]
    paths.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'hops') cmp = a.hopCount - b.hopCount
      else if (sortKey === 'weight') cmp = a.totalWeight - b.totalWeight
      else cmp = a.nodes.join(',').localeCompare(b.nodes.join(','))
      return sortAsc ? cmp : -cmp
    })
    return paths
  }, [analysis.enumeration.paths, sortKey, sortAsc])

  const selectedPath =
    sortedPaths.find((p) => p.nodes.join('→') === selectedPathKey)?.nodes ??
    (analysis.dijk.ok && analysis.dijk.path.nodes.length ? analysis.dijk.path.nodes : null)

  const anim = usePacketAnimation(selectedPath, animSpeed)
  const packetPos = selectedPath ? interpolatePacket(graph, selectedPath, anim.progress) : null
  const activeEdgeId =
    selectedPath && selectedPath.length > 1
      ? pathEdgeIds(graph, selectedPath)[anim.segmentIndex] ?? null
      : null

  const toggleEdge = (edgeId: string) => {
    const edge = graph.edges.find((e) => e.id === edgeId)
    if (!edge) return
    if (analysis.dijk.ok && Number.isFinite(analysis.dijk.distance)) {
      setPrevShortestCost(analysis.dijk.distance)
    }
    applyGraphOp(setEdgeActive(graph, edgeId, !edge.active))
  }

  const currentCost = analysis.dijk.ok && Number.isFinite(analysis.dijk.distance) ? analysis.dijk.distance : null
  const costSummary =
    prevShortestCost !== null && currentCost !== null && prevShortestCost !== currentCost
      ? `Shortest cost ${prevShortestCost} → ${currentCost}`
      : analysis.dijk.ok && !Number.isFinite(analysis.dijk.distance) && prevShortestCost !== null
        ? `Shortest cost ${prevShortestCost} → destination unreachable`
        : null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Route Analysis</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Enumerate simple paths, animate a visual packet, and simulate link failures.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          Source
          <select
            className="ml-2 min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 font-mono"
            value={sourceId ?? ''}
            onChange={(e) => setSourceId(e.target.value || null)}
          >
            <option value="">—</option>
            {graph.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Destination
          <select
            className="ml-2 min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 font-mono"
            value={destId ?? ''}
            onChange={(e) => setDestId(e.target.value || null)}
          >
            <option value="">—</option>
            {graph.nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm"
          onClick={restoreEdges}
        >
          Restore all links
        </button>
      </div>

      {costSummary && (
        <p className="rounded-lg border border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] px-3 py-2 text-sm">
          {costSummary}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div>
          <NetworkCanvas
            graph={graph}
            onGraphChange={setGraph}
            sourceId={sourceId}
            destId={destId}
            selectedNodeId={null}
            onSelectNode={() => {}}
            mode="view"
            snapToGrid={false}
            highlightPath={selectedPath ?? []}
            highlightEdges={selectedPath ? pathEdgeIds(graph, selectedPath) : []}
            activeEdgeId={activeEdgeId}
            packetPos={packetPos}
            onToggleEdge={toggleEdge}
            showFailureControls
          />
          <StatusBar
            graph={graph}
            algorithm="DFS path enumeration + Dijkstra"
            connectivity={analysis.connectivity.labels}
          />
        </div>
        <ResultsPanel
          sourceId={sourceId}
          destId={destId}
          nodeCount={graph.nodes.length}
          edgeCount={graph.edges.length}
          enumeration={analysis.enumeration}
          dijk={analysis.dijk}
          connectivity={analysis.connectivity}
          selectedPath={selectedPath}
          algorithmLabel="Route analysis"
        />
      </div>

      <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <h3 className="font-medium">Packet animation (visual simulation only)</h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]" aria-live="polite">
          {anim.liveMessage}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className="min-h-11 rounded-lg bg-[var(--accent)] px-3 text-sm text-white" onClick={anim.play}>
            Play
          </button>
          <button type="button" className="min-h-11 rounded-lg border px-3 text-sm" onClick={anim.pause}>
            Pause
          </button>
          <button type="button" className="min-h-11 rounded-lg border px-3 text-sm" onClick={anim.reset}>
            Reset
          </button>
          <label className="flex items-center gap-2 text-sm">
            Speed {animSpeed.toFixed(2)}×
            <input
              type="range"
              min={0.25}
              max={4}
              step={0.25}
              value={animSpeed}
              onChange={(e) => setAnimSpeed(Number(e.target.value))}
              aria-label="Animation speed"
            />
          </label>
          <span className="font-mono text-sm">{Math.round(anim.progress * 100)}%</span>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <h3 className="font-medium">Simple paths</h3>
        <p className="text-xs text-[var(--text-muted)]">{PATH_ENUM_WARNING}</p>
        {analysis.enumeration.truncated && (
          <p className="mt-2 text-sm text-[var(--warning)]">
            Enumeration limit reached — showing at least {analysis.enumeration.paths.length} paths.
          </p>
        )}
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-[var(--text-muted)]">
                <SortTh label="Route" active={sortKey === 'lex'} asc={sortAsc} onClick={() => toggleSort('lex', sortKey, sortAsc, setSortKey, setSortAsc)} />
                <SortTh label="Hops" active={sortKey === 'hops'} asc={sortAsc} onClick={() => toggleSort('hops', sortKey, sortAsc, setSortKey, setSortAsc)} />
                <SortTh label="Weight" active={sortKey === 'weight'} asc={sortAsc} onClick={() => toggleSort('weight', sortKey, sortAsc, setSortKey, setSortAsc)} />
              </tr>
            </thead>
            <tbody>
              {sortedPaths.map((p) => (
                <PathRow
                  key={p.nodes.join('→')}
                  path={p}
                  selected={p.nodes.join('→') === selectedPathKey}
                  onSelect={() => setSelectedPathKey(p.nodes.join('→'))}
                />
              ))}
            </tbody>
          </table>
          {sortedPaths.length === 0 && sourceId && destId && (
            <p className="py-4 text-sm text-[var(--text-muted)]">No simple paths found over active links.</p>
          )}
        </div>
      </section>
    </div>
  )
}

function toggleSort(
  key: SortKey,
  current: SortKey,
  asc: boolean,
  setKey: (k: SortKey) => void,
  setAsc: (a: boolean) => void,
) {
  if (current === key) setAsc(!asc)
  else {
    setKey(key)
    setAsc(true)
  }
}

function SortTh({
  label,
  active,
  asc,
  onClick,
}: {
  label: string
  active: boolean
  asc: boolean
  onClick: () => void
}) {
  return (
    <th className="p-2">
      <button type="button" className="font-medium hover:text-[var(--text)]" onClick={onClick}>
        {label}
        {active ? (asc ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  )
}

function PathRow({
  path,
  selected,
  onSelect,
}: {
  path: PathResult
  selected: boolean
  onSelect: () => void
}) {
  return (
    <tr
      className={`cursor-pointer border-t border-[var(--border)] ${selected ? 'bg-[color-mix(in_srgb,var(--accent)_15%,transparent)]' : ''}`}
      onClick={onSelect}
    >
      <td className="p-2 font-mono text-xs">{path.nodes.join(' → ')}</td>
      <td className="p-2 font-mono">{path.hopCount}</td>
      <td className="p-2 font-mono">{path.totalWeight}</td>
    </tr>
  )
}
