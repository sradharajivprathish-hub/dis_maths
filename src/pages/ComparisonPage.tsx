import { useMemo, useState } from 'react'
import { NetworkCanvas } from '../components/graph/NetworkCanvas.tsx'
import { useApp } from '../hooks/AppProvider.tsx'
import { useGraphAnalysis } from '../hooks/useGraphAnalysis.ts'
import { dijkstra } from '../algorithms/dijkstra.ts'
import { enumerateSimplePaths } from '../algorithms/enumeratePaths.ts'

export function ComparisonPage() {
  const { graph, sourceId, destId } = useApp()
  const analysis = useGraphAnalysis(graph, sourceId, destId)
  const [timing, setTiming] = useState<{ tEnum: number; tDijk: number } | null>(null)

  const dfsShortest = useMemo(() => {
    const paths = analysis.enumeration.paths
    if (paths.length === 0) return null
    return paths.reduce((best, p) => (p.totalWeight < best.totalWeight ? p : best))
  }, [analysis.enumeration.paths])

  const measureTiming = () => {
    if (!sourceId || !destId) return
    const t0 = performance.now()
    for (let i = 0; i < 50; i++) enumerateSimplePaths(graph, sourceId, destId)
    const tEnum = (performance.now() - t0) / 50
    const t1 = performance.now()
    for (let i = 0; i < 200; i++) dijkstra(graph, sourceId, destId)
    const tDijk = (performance.now() - t1) / 200
    setTiming({ tEnum, tDijk })
  }

  const rows = [
    {
      name: 'DFS enumeration',
      route: dfsShortest?.nodes.join(' → ') ?? '—',
      hops: dfsShortest ? String(dfsShortest.hopCount) : '—',
      weight: dfsShortest ? String(dfsShortest.totalWeight) : '—',
      note: 'Lists all simple paths; shortest-by-weight is the minimum over the list, not a single DFS pass.',
    },
    {
      name: 'BFS (min hops)',
      route: analysis.bfs?.nodes.length ? analysis.bfs.nodes.join(' → ') : 'Unreachable',
      hops: analysis.bfs?.nodes.length ? String(analysis.bfs.hopCount) : '—',
      weight: analysis.bfs?.nodes.length ? String(analysis.bfs.totalWeight) : '—',
      note: 'Ignores edge weights; minimizes number of links.',
    },
    {
      name: "Dijkstra (min cost)",
      route: analysis.dijk.ok && analysis.dijk.path.nodes.length ? analysis.dijk.path.nodes.join(' → ') : 'Unreachable',
      hops:
        analysis.dijk.ok && analysis.dijk.path.nodes.length
          ? String(analysis.dijk.path.hopCount)
          : '—',
      weight:
        analysis.dijk.ok && Number.isFinite(analysis.dijk.distance)
          ? String(analysis.dijk.distance)
          : '—',
      note: 'Non-negative weights; tie-break by lexicographically smallest label when distances tie.',
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Algorithm Comparison</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Side-by-side behavior for source {sourceId ?? '—'} → destination {destId ?? '—'} on the live graph.
        </p>
      </div>

      <NetworkCanvas
        graph={graph}
        onGraphChange={() => {}}
        sourceId={sourceId}
        destId={destId}
        selectedNodeId={null}
        onSelectNode={() => {}}
        mode="view"
        snapToGrid={false}
        highlightPath={
          analysis.dijk.ok && analysis.dijk.path.nodes.length ? analysis.dijk.path.nodes : []
        }
      />

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[var(--surface-raised)] text-[var(--text-muted)]">
            <tr>
              <th className="p-3">Algorithm</th>
              <th className="p-3">Route</th>
              <th className="p-3">Hops</th>
              <th className="p-3">Total weight</th>
              <th className="p-3">Behavior</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-[var(--border)]">
                <td className="p-3 font-medium">{row.name}</td>
                <td className="p-3 font-mono text-xs">{row.route}</td>
                <td className="p-3 font-mono">{row.hops}</td>
                <td className="p-3 font-mono">{row.weight}</td>
                <td className="p-3 text-[var(--text-muted)]">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm"
          onClick={measureTiming}
        >
          Measure local timing
        </button>
        {timing && (
          <p className="text-xs text-[var(--text-muted)]">
            Approximate local measurement (device-dependent): enumeration ~{timing.tEnum.toFixed(3)} ms,
            Dijkstra ~{timing.tDijk.toFixed(3)} ms per call on this graph.
          </p>
        )}
      </div>

      {analysis.bfs &&
        analysis.bfs.nodes.length > 0 &&
        analysis.dijk.ok &&
        analysis.bfs.hopCount !== analysis.dijk.path.hopCount && (
          <p className="rounded-lg border border-[var(--accent-cyan)] p-3 text-sm">
            On this graph, the fewest-hop BFS route can differ from the minimum-weight Dijkstra route — compare
            the weight column above.
          </p>
        )}
    </div>
  )
}
