import { describe, expect, it } from 'vitest'
import { createSampleGraph } from '../data/sampleGraph.ts'
import { bfsShortestHops } from './bfs.ts'
import { dijkstra } from './dijkstra.ts'
import { enumerateSimplePaths } from './enumeratePaths.ts'
import { connectNodes, setEdgeActive } from '../graph/operations.ts'

describe('enumerateSimplePaths', () => {
  it('chain has one path', () => {
    let g = createSampleGraph()
    g = { nodes: g.nodes.filter((n) => ['A', 'B', 'C'].includes(n.id)), edges: [] }
    g = connectNodes(g, 'A', 'B', 1).value
    g = connectNodes(g, 'B', 'C', 1).value
    const r = enumerateSimplePaths(g, 'A', 'C')
    expect(r.paths).toHaveLength(1)
  })

  it('two parallel routes', () => {
    let g = createSampleGraph()
    g = {
      nodes: [
        { id: 'A', label: 'A', x: 0, y: 0 },
        { id: 'B', label: 'B', x: 1, y: 0 },
        { id: 'C', label: 'C', x: 2, y: 0 },
      ],
      edges: [],
    }
    g = connectNodes(g, 'A', 'B', 1).value
    g = connectNodes(g, 'A', 'C', 1).value
    g = connectNodes(g, 'B', 'C', 1).value
    const r = enumerateSimplePaths(g, 'A', 'C')
    expect(r.paths.length).toBeGreaterThanOrEqual(2)
  })

  it('source equals destination', () => {
    const g = createSampleGraph()
    const r = enumerateSimplePaths(g, 'A', 'A')
    expect(r.paths[0]?.hopCount).toBe(0)
  })

  it('excludes failed edges', () => {
    let g = createSampleGraph()
    const edge = g.edges.find((e) => e.source === 'A' && e.target === 'B')!
    g = setEdgeActive(g, edge.id, false).value
    const before = enumerateSimplePaths(g, 'A', 'F').paths.length
    expect(before).toBeGreaterThan(0)
    g = setEdgeActive(g, edge.id, true).value
    const after = enumerateSimplePaths(g, 'A', 'F').paths.length
    expect(after).toBeGreaterThanOrEqual(before)
  })

  it('truncates at limit', () => {
    const g = createSampleGraph()
    const r = enumerateSimplePaths(g, 'A', 'F', { maxPaths: 2 })
    expect(r.truncated).toBe(true)
    expect(r.paths).toHaveLength(2)
  })
})

describe('dijkstra', () => {
  it('sample graph minimum cost A to F', () => {
    const g = createSampleGraph()
    const r = dijkstra(g, 'A', 'F')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.distance).toBe(9)
      expect(r.path.nodes.join('-')).toBe('A-B-C-D-E-F')
    }
  })

  it('rejects negative weights', () => {
    let g = createSampleGraph()
    const e = g.edges[0]!
    g = {
      ...g,
      edges: g.edges.map((x) => (x.id === e.id ? { ...x, weight: -1 } : x)),
    }
    expect(dijkstra(g, 'A', 'F').ok).toBe(false)
  })

  it('zero-weight edges are valid', () => {
    let g = createSampleGraph()
    g = {
      nodes: [
        { id: 'A', label: 'A', x: 0, y: 0 },
        { id: 'B', label: 'B', x: 1, y: 0 },
      ],
      edges: [{ id: 'e', source: 'A', target: 'B', weight: 0, active: true }],
    }
    const r = dijkstra(g, 'A', 'B')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.distance).toBe(0)
  })
})

describe('bfs', () => {
  it('fewest hops may differ from min weight on sample', () => {
    const g = createSampleGraph()
    const hops = bfsShortestHops(g, 'A', 'F')
    const weight = dijkstra(g, 'A', 'F')
    expect(hops).not.toBeNull()
    if (weight.ok && hops) {
      expect(hops.hopCount).toBeLessThanOrEqual(weight.path.hopCount + 2)
    }
  })
})
