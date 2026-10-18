import { buildAdjacency } from '../graph/adjacency.ts'
import type { Graph, NodeId, PathResult } from '../types/graph.ts'

export function bfsShortestHops(
  graph: Graph,
  source: NodeId | null,
  dest: NodeId | null,
): PathResult | null {
  if (!source || !dest) return null
  if (!graph.nodes.some((n) => n.id === source) || !graph.nodes.some((n) => n.id === dest)) {
    return null
  }
  if (source === dest) {
    return { nodes: [source], totalWeight: 0, hopCount: 0 }
  }

  const adj = buildAdjacency(graph)
  const queue: NodeId[] = [source]
  const pred = new Map<NodeId, NodeId | null>()
  pred.set(source, null)
  const visited = new Set<NodeId>([source])

  while (queue.length > 0) {
    const u = queue.shift()!
    if (u === dest) break
    for (const { neighbor } of adj.get(u) ?? []) {
      if (visited.has(neighbor)) continue
      visited.add(neighbor)
      pred.set(neighbor, u)
      queue.push(neighbor)
    }
  }

  if (!pred.has(dest)) {
    return null
  }

  const path: NodeId[] = []
  let cur: NodeId | null = dest
  while (cur !== null) {
    path.push(cur)
    cur = pred.get(cur) ?? null
  }
  path.reverse()

  let totalWeight = 0
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]!
    const b = path[i + 1]!
    const edge = graph.edges.find(
      (e) =>
        e.active &&
        ((e.source === a && e.target === b) || (e.source === b && e.target === a)),
    )
    totalWeight += edge?.weight ?? 0
  }

  return { nodes: path, totalWeight, hopCount: path.length - 1 }
}
