import type { ReactNode } from 'react'
import { useApp } from '../hooks/AppProvider.tsx'

export function AboutPage() {
  const { projectDetails, setProjectDetails } = useApp()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">NetRoute — About Project</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Discrete Mathematics: graph routing, counting, and induction
        </p>
      </header>

      <Section title="Problem statement">
        How do data packets travel through a network modeled as an undirected weighted graph? NetRoute lets you
        edit topologies, enumerate simple paths, compute shortest routes, compare algorithms, and relate
        combinatorial formulas to graph structure — with clear separation between unrestricted arrangements
        and valid network paths.
      </Section>

      <Section title="Objectives">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Represent networks as simple weighted graphs (vertices = devices, edges = links).</li>
          <li>Enumerate simple paths with safe limits and honest truncation labels.</li>
          <li>Implement Dijkstra (min cost), BFS (min hops), and connectivity analysis.</li>
          <li>Connect permutations, combinations, and induction to counting concepts.</li>
          <li>Visualize routes with an educational packet animation (not real traffic).</li>
        </ul>
      </Section>

      <Section title="Graph representation">
        Vertices store layout coordinates for SVG rendering. Edges are undirected, weighted, and may be marked
        inactive to simulate failures. All statistics are derived from this single graph state.
      </Section>

      <Section title="Limitations">
        Exhaustive path enumeration is exponential; use small graphs. Dijkstra rejects negative weights. The
        simulator is client-side only with no real routing. Execution-time numbers are approximate local
        measurements.
      </Section>

      <Section title="Future enhancements">
        Step-by-step Dijkstra trace export, additional layout algorithms, weighted failure probabilities, and
        import/export of graph JSON.
      </Section>

      <Section title="Project details (optional, stored locally only)">
        <div className="grid gap-3 sm:grid-cols-2">
          {(['institution', 'student', 'course', 'instructor'] as const).map((key) => (
            <label key={key} className="text-sm capitalize">
              {key}
              <input
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-2"
                placeholder={`Your ${key}`}
                value={projectDetails[key]}
                onChange={(e) => setProjectDetails({ ...projectDetails, [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
      </Section>

      <p className="text-xs text-[var(--text-muted)]">
        Educational simulator only. Packet motion is a visual simulation; no real network traffic is routed.
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-2 text-sm text-[var(--text-muted)]">{children}</div>
    </section>
  )
}
