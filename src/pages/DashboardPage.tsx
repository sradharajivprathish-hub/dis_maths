import { useApp } from '../hooks/AppProvider.tsx'
import { useGraphAnalysis } from '../hooks/useGraphAnalysis.ts'
import { NetworkCanvas } from '../components/graph/NetworkCanvas.tsx'
import { ResultsPanel } from '../components/panels/ResultsPanel.tsx'

export function DashboardPage() {
  const { graph, sourceId, destId, navigate, loadSample, setGraph, selectedPathKey, setSelectedPathKey } =
    useApp()
  const analysis = useGraphAnalysis(graph, sourceId, destId)

  const selectedPath =
    analysis.enumeration.paths.find((p) => p.nodes.join('→') === selectedPathKey)?.nodes ??
    (analysis.dijk.ok && analysis.dijk.path.nodes.length ? analysis.dijk.path.nodes : null)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-sm text-[var(--text-muted)]">Live metrics from the current network state.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Nodes" value={String(graph.nodes.length)} />
        <Stat label="Links" value={String(graph.edges.length)} />
        <Stat
          label="Simple paths"
          value={
            !sourceId || !destId
              ? 'Not calculated yet'
              : analysis.enumeration.truncated
                ? `≥ ${analysis.enumeration.paths.length}`
                : String(analysis.enumeration.paths.length)
          }
        />
        <Stat
          label="Shortest cost"
          value={
            !sourceId || !destId
              ? 'Not calculated yet'
              : analysis.dijk.ok && Number.isFinite(analysis.dijk.distance)
                ? String(analysis.dijk.distance)
                : 'Unreachable'
          }
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Action onClick={() => navigate('simulator')}>Open Simulator</Action>
        <Action onClick={loadSample}>Load Sample Network</Action>
        <Action
          onClick={() => {
            if (analysis.dijk.ok && analysis.dijk.path.nodes.length) {
              setSelectedPathKey(analysis.dijk.path.nodes.join('→'))
            }
            navigate('routes')
          }}
        >
          Find Shortest Path
        </Action>
        <Action onClick={() => navigate('routes')}>Count Valid Paths</Action>
        <Action onClick={() => navigate('combinatorics')}>Open Mathematics Lab</Action>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
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
        />
        <ResultsPanel
          sourceId={sourceId}
          destId={destId}
          nodeCount={graph.nodes.length}
          edgeCount={graph.edges.length}
          enumeration={analysis.enumeration}
          dijk={analysis.dijk}
          connectivity={analysis.connectivity}
          selectedPath={selectedPath}
          algorithmLabel="Dashboard overview"
        />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="font-mono text-2xl font-semibold">{value}</p>
    </div>
  )
}

function Action({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm hover:border-[var(--accent)]"
    >
      {children}
    </button>
  )
}
