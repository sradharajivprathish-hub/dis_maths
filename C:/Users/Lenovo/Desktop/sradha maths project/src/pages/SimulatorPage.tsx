import { useApp } from '../hooks/AppProvider.tsx'
import { NetworkCanvas } from '../components/graph/NetworkCanvas.tsx'
import { StatusBar } from '../components/graph/StatusBar.tsx'
import {
  addNode,
  deleteEdge,
  renameNode,
  updateEdgeWeight,
} from '../graph/operations.ts'
import type { SimulatorMode } from '../types/app.ts'

const MODES: { id: SimulatorMode; label: string }[] = [
  { id: 'select', label: 'Select / Move' },
  { id: 'add', label: 'Add Node' },
  { id: 'connect', label: 'Connect' },
  { id: 'delete', label: 'Delete' },
]

export function SimulatorPage() {
  const {
    graph,
    setGraph,
    applyGraphOp,
    simulatorMode,
    setSimulatorMode,
    sourceId,
    destId,
    setSourceId,
    setDestId,
    selectedNodeId,
    setSelectedNodeId,
    snapToGrid,
    setSnapToGrid,
    loadSample,
    clearGraph,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useApp()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Network Simulator</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Edit the graph with canvas tools or the accessible node list below.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`min-h-11 rounded-lg px-3 py-2 text-sm ${
              simulatorMode === m.id
                ? 'bg-[var(--accent)] text-white'
                : 'border border-[var(--border)] bg-[var(--surface)]'
            }`}
            onClick={() => setSimulatorMode(m.id)}
          >
            {m.label}
          </button>
        ))}
        <button type="button" className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm" onClick={loadSample}>
          Load sample
        </button>
        <button type="button" className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm" onClick={clearGraph}>
          Clear
        </button>
        <button type="button" disabled={!canUndo} className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm disabled:opacity-40" onClick={undo}>
          Undo
        </button>
        <button type="button" disabled={!canRedo} className="min-h-11 rounded-lg border border-[var(--border)] px-3 text-sm disabled:opacity-40" onClick={redo}>
          Redo
        </button>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
          Snap to grid
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
          <h3 className="mb-2 font-medium">Nodes</h3>
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {graph.nodes.map((n) => (
              <li key={n.id} className="rounded border border-[var(--border)] p-2">
                <div className="font-mono font-medium">{n.id}</div>
                <input
                  className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--surface-raised)] px-1 text-xs"
                  value={n.label}
                  aria-label={`Label for ${n.id}`}
                  onChange={(e) => applyGraphOp(renameNode(graph, n.id, e.target.value))}
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  <button type="button" className="rounded border px-1 text-xs" onClick={() => setSourceId(n.id)}>
                    Source
                  </button>
                  <button type="button" className="rounded border px-1 text-xs" onClick={() => setDestId(n.id)}>
                    Dest
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <form
            className="mt-3 flex gap-1"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const id = String(fd.get('id') ?? '').trim()
              if (!id) return
              applyGraphOp(addNode(graph, { id, label: id }))
              e.currentTarget.reset()
            }}
          >
            <input name="id" placeholder="New ID" className="flex-1 rounded border px-2 text-xs" aria-label="New node ID" />
            <button type="submit" className="rounded bg-[var(--accent)] px-2 text-xs text-white">
              Add
            </button>
          </form>
        </div>
        <div>
          <NetworkCanvas
            graph={graph}
            onGraphChange={setGraph}
            sourceId={sourceId}
            destId={destId}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            mode={simulatorMode}
            snapToGrid={snapToGrid}
          />
          <StatusBar graph={graph} algorithm="Graph editor" connectivity="—" />
        </div>
      </div>
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] p-3 text-sm">
        <h3 className="font-medium">Links</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-xs">
            <thead>
              <tr className="text-[var(--text-muted)]">
                <th className="p-1">Endpoints</th>
                <th className="p-1">Weight</th>
                <th className="p-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {graph.edges.map((e) => (
                <tr key={e.id} className="border-t border-[var(--border)]">
                  <td className="p-1 font-mono">
                    {e.source} — {e.target}
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className="w-16 rounded border px-1 font-mono"
                      defaultValue={e.weight}
                      aria-label={`Weight ${e.source} to ${e.target}`}
                      onBlur={(ev) => {
                        const w = Number(ev.target.value)
                        applyGraphOp(updateEdgeWeight(graph, e.id, w))
                      }}
                    />
                  </td>
                  <td className="p-1">
                    <button
                      type="button"
                      className="text-[var(--danger)]"
                      onClick={() => applyGraphOp(deleteEdge(graph, e.id))}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
