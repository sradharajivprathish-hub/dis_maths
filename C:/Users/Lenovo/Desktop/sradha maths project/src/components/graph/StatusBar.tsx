import type { Graph } from '../../types/graph.ts'

interface StatusBarProps {
  graph: Graph
  algorithm: string
  connectivity: string
}

export function StatusBar({ graph, algorithm, connectivity }: StatusBarProps) {
  const activeEdges = graph.edges.filter((e) => e.active).length
  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 font-mono text-xs text-[var(--text-muted)]"
      role="status"
    >
      <span>
        <span className="inline-block h-2 w-2 rounded-full bg-[var(--success)]" aria-hidden />{' '}
        {connectivity}
      </span>
      <span>Nodes: {graph.nodes.length}</span>
      <span>
        Links: {activeEdges}/{graph.edges.length} active
      </span>
      <span>Algorithm: {algorithm}</span>
    </div>
  )
}
