import type { DijkstraResult } from '../../algorithms/dijkstra.ts'
import type { EnumerateResult } from '../../algorithms/enumeratePaths.ts'
import type { ConnectivityReport } from '../../algorithms/connectivity.ts'
import type { NodeId } from '../../types/graph.ts'
import { PATH_ENUM_WARNING } from '../../types/app.ts'

interface ResultsPanelProps {
  sourceId: NodeId | null
  destId: NodeId | null
  nodeCount: number
  edgeCount: number
  enumeration: EnumerateResult
  dijk: DijkstraResult
  connectivity: ConnectivityReport
  selectedPath: NodeId[] | null
  algorithmLabel: string
  loading?: boolean
}

export function ResultsPanel({
  sourceId,
  destId,
  nodeCount,
  edgeCount,
  enumeration,
  dijk,
  connectivity,
  selectedPath,
  algorithmLabel,
  loading,
}: ResultsPanelProps) {
  if (!sourceId || !destId) {
    return (
      <aside className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="mb-2 text-sm font-semibold">Results</h2>
        <p className="text-sm text-[var(--text-muted)]">Select a source and destination to analyze routes.</p>
      </aside>
    )
  }

  const pathCountLabel = enumeration.truncated
    ? `at least ${enumeration.paths.length}`
    : String(enumeration.paths.length)

  const shortest =
    dijk.ok && Number.isFinite(dijk.distance) ? dijk.distance : null

  return (
    <aside
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4"
      aria-live="polite"
    >
      <h2 className="mb-3 text-sm font-semibold">Results</h2>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-3 rounded bg-[var(--surface-raised)]" />
          <div className="h-3 w-2/3 rounded bg-[var(--surface-raised)]" />
        </div>
      ) : (
        <dl className="space-y-2 text-sm">
          <Row label="Source → Dest" value={`${sourceId} → ${destId}`} mono />
          <Row label="Nodes / Links" value={`${nodeCount} / ${edgeCount}`} mono />
          <Row label="Connectivity" value={connectivity.labels} />
          <Row label="Simple paths" value={pathCountLabel} mono />
          <Row
            label="Shortest cost"
            value={shortest === null ? 'Unreachable' : String(shortest)}
            mono
          />
          {dijk.ok && dijk.equalCostCount > 1 && (
            <Row label="Equal-cost routes" value={String(dijk.equalCostCount)} mono />
          )}
          <Row label="Algorithm" value={algorithmLabel} />
          <Row
            label="Selected route"
            value={selectedPath?.join(' → ') ?? 'None selected'}
            mono
          />
          {selectedPath && (
            <Row label="Hops" value={String(Math.max(0, selectedPath.length - 1))} mono />
          )}
        </dl>
      )}
      <p className="mt-3 text-xs text-[var(--text-muted)]">{PATH_ENUM_WARNING}</p>
    </aside>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-2 border-b border-[var(--border)] pb-1 last:border-0">
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className={mono ? 'font-mono text-right' : 'text-right'}>{value}</dd>
    </div>
  )
}
