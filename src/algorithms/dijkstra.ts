import { buildAdjacency } from '../graph/adjacency.ts'
import type { Graph, NodeId, PathResult } from '../types/graph.ts'

export type DijkstraError = 'NEGATIVE_WEIGHT' | 'MISSING_NODE'

export interface DijkstraSuccess {
  ok: true
  path: PathResult
  distance: number
  equalCostCount: number
  equalCostPaths: PathResult[]
}

export interface DijkstraFailure {
  ok: false
  error: DijkstraError
  message: string
}

export type DijkstraResult = DijkstraSuccess | DijkstraFailure

function reconstruct(predecessor: Map<NodeId, NodeId | null>, source: NodeId, dest: NodeId): NodeId[] {
  const path: NodeId[] = []
  let cur: NodeId | null = dest
  while (cur !== null) {
    path.push(cur)
    cur = predecessor.get(cur) ?? null
    if (path.length > 500) break
  }
  path.reverse()
  if (path[0] !== source) return []
  return path
}

function pathFromNodes(graph: Graph, nodes: NodeId[]): PathResult {
  let total = 0
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i]!
    const b = nodes[i + 1]!
    const edge = graph.edges.find(
      (e) =>
        e.active &&
        ((e.source === a && e.target === b) || (e.source === b && e.target === a)),
    )
    total += edge?.weight ?? Infinity
  }
  return { nodes, totalWeight: total, hopCount: Math.max(0, nodes.length - 1) }
}

export function dijkstra(graph: Graph, source: NodeId | null, dest: NodeId | null): DijkstraResult {
  if (!source || !dest) {
    return { ok: false, error: 'MISSING_NODE', message: 'Select source and destination.' }
  }
  if (!graph.nodes.some((n) => n.id === source) || !graph.nodes.some((n) => n.id === dest)) {
    return { ok: false, error: 'MISSING_NODE', message: 'Source or destination is not on the graph.' }
  }

  for (const e of graph.edges) {
    if (!e.active) continue
    if (!Number.isFinite(e.weight) || e.weight < 0) {
      return {
        ok: false,
        error: 'NEGATIVE_WEIGHT',
        message: 'Dijkstra requires non-negative, finite edge weights.',
      }
    }
  }

  if (source === dest) {
    const trivial = { nodes: [source], totalWeight: 0, hopCount: 0 }
    return { ok: true, path: trivial, distance: 0, equalCostCount: 1, equalCostPaths: [trivial] }
  }

  const labels = graph.nodes.map((n) => n.id).sort((a, b) => a.localeCompare(b))
  const dist = new Map<NodeId, number>()
  const pred = new Map<NodeId, NodeId | null>()
  const settled = new Set<NodeId>()

  for (const id of labels) {
    dist.set(id, Infinity)
    pred.set(id, null)
  }
  dist.set(source, 0)

  while (settled.size < labels.length) {
    let u: NodeId | null = null
    let best = Infinity
    for (const id of labels) {
      if (settled.has(id)) continue
      const d = dist.get(id)!
      if (d > best) continue
      if (d < best || u === null || id.localeCompare(u) < 0) {
        best = d
        u = id
      }
    }
    if (u === null || best === Infinity) break
    settled.add(u)

    const adj = buildAdjacency(graph).get(u) ?? []
    for (const { neighbor, weight } of adj) {
      if (settled.has(neighbor)) continue
      const alt = dist.get(u)! + weight
      const cur = dist.get(neighbor)!
      if (alt < cur) {
        dist.set(neighbor, alt)
        pred.set(neighbor, u)
      }
    }
  }

  const distance = dist.get(dest)!
  if (!Number.isFinite(distance)) {
    const unreachable = { nodes: [] as NodeId[], totalWeight: Infinity, hopCount: 0 }
    return { ok: true, path: unreachable, distance: Infinity, equalCostCount: 0, equalCostPaths: [] }
  }

  const primaryNodes = reconstruct(pred, source, dest)
  const primary = pathFromNodes(graph, primaryNodes)

  const enumAll = enumerateEqualCostPaths(graph, source, dest, distance)
  return {
    ok: true,
    path: primary,
    distance,
    equalCostCount: enumAll.length,
    equalCostPaths: enumAll,
  }
}

function enumerateEqualCostPaths(
  graph: Graph,
  source: NodeId,
  dest: NodeId,
  targetCost: number,
): PathResult[] {
  const adj = buildAdjacency(graph)
  const results: PathResult[] = []
  const max = 100

  type Frame = { node: NodeId; path: NodeId[]; cost: number; visited: Set<NodeId> }
  const stack: Frame[] = [{ node: source, path: [source], cost: 0, visited: new Set([source]) }]

  while (stack.length > 0 && results.length < max) {
    const f = stack.pop()!
    if (f.cost > targetCost) continue
    if (f.node === dest) {
      if (f.cost === targetCost) {
        results.push({ nodes: f.path, totalWeight: f.cost, hopCount: f.path.length - 1 })
      }
      continue
    }
    const neighbors = adj.get(f.node) ?? []
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const { neighbor, weight } = neighbors[i]!
      if (f.visited.has(neighbor)) continue
      const nextCost = f.cost + weight
      if (nextCost > targetCost) continue
      const visited = new Set(f.visited)
      visited.add(neighbor)
      stack.push({
        node: neighbor,
        path: [...f.path, neighbor],
        cost: nextCost,
        visited,
      })
    }
  }

  results.sort((a, b) => a.nodes.join(',').localeCompare(b.nodes.join(',')))
  return results
}
